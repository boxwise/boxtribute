"""Utility functions for pagination.

The program uses cursor style pagination, consisting of two steps: fetching the actual
content of the page, and determining page meta data.

The following explains forward pagination. Assume a model holding 9 elements
(represented by their IDs)
    Model 1 2 3 4 5 6 7 8 9
The client now requests a page of the first 3 elements at the beginning of the model
    query { models(first: 3) { elements { id } } }
The start cursor to select a slice of elements after defaults to 0. For later
computation of the existence of a next page, the given limit (3) must be increased by 1
    model.select().limit(limit + 1)
This way the first 4 elements are obtained.
         |-------|
    Model 1 2 3 4 5 6 7 8 9
For determining the page meta data, the algorithm (`_generate_page_info()` function)
- notices that the size of the slice (4) extends the requested limit (3), hence a next
  page exists
- queries the model for any elements before the first one of the slice (ID 1). Since
there aren't any, no previous page exists
- assigns the first element (ID 1) as the start cursor
- assigns the second-to-last element (ID 3) as the end cursor
Eventually, the page meta data, and first 3 elements (IDs 1, 2, 3) are returned.

A request like
    query { models(after: 6, first: 3) { elements { id } } }
selects
                     |-----|
    Model 1 2 3 4 5 6 7 8 9
The algorithm
- notices that the slice size (3) is not larger than the requested limit (3), hence no
  next page exists
- finds an element before ID 7, hence a previous page exists
- assigns ID 7 as start and ID 9 as end cursor

For backward pagination, the procedure works in reverse.
"""

import base64

from ..exceptions import InvalidPaginationInput


class PageInfo:
    """Container for pagination information."""

    def __init__(self):
        self.has_previous_page = False
        self.has_next_page = False
        self.start_cursor = ""
        self.end_cursor = ""


def pagination_parameters(pagination_input, **cursor_kwargs):
    """Retrieve cursor and limit (default: Cursor() and 50, resp.) from the given
    pagination input dictionary.
    The values of `after`/`first` take precedence over `before`/`last`.
    """
    limit = 50
    if pagination_input is None:
        return Cursor(**cursor_kwargs), limit

    after_value = pagination_input.get("after")
    first = pagination_input.get("first")
    if after_value is not None or first is not None:
        return Cursor(value=after_value, **cursor_kwargs), first or limit

    return Cursor(
        value=pagination_input.get("before"), forwards=False, **cursor_kwargs
    ), pagination_input.get("last", limit)


class Cursor:
    """Representation of pagination cursor, translating from GraphQL to data layer.

    The cursor now encodes a composite key: the value of the field results are
    ordered by (default: `id`), plus `id` itself as a stable tiebreaker. This is
    required because `order_by_field` may differ from `id` (e.g.
    `Box.last_modified_on.desc()`), in which case `id` alone cannot be used to
    determine pagination conditions or previous/next page existence.
    """

    def __init__(self, *, value=None, forwards=True, order_by_field, descending):
        if value is None and not forwards:
            raise InvalidPaginationInput()

        self.order_by_field = order_by_field
        self.is_descending = descending

        if value is None:
            self.sort_value = None
            self.id_value = 0
        else:
            decoded = base64.b64decode(value).decode()
            # format: "<id>" (legacy / default id-ordering) or "<id>|<sort_value>"
            parts = decoded.split("|", 1)
            self.id_value = int(parts[0])
            self.sort_value = parts[1] if len(parts) > 1 else None

        self.forwards = forwards

    def pagination_condition(self, model):
        """Build the WHERE condition selecting elements after/before this cursor,
        consistent with the field(s) results are ordered by.
        """
        if self.order_by_field is None or self.sort_value is None:
            # Default ordering by id only (covers the common case and the first
            # page where no sort_value has been established yet).
            if self.forwards:
                return model.id > self.id_value
            return model.id < self.id_value

        field = self.order_by_field
        sort_value = self.sort_value

        # "greater" means: move towards elements that come LATER in the result
        # order. For ascending fields, forward pagination wants field > value;
        # for descending fields, forward pagination wants field < value (and
        # vice versa for backward pagination).
        want_greater = self.forwards != self.is_descending

        if want_greater:
            return (field > sort_value) | (
                (field == sort_value) & (model.id > self.id_value)
            )
        return (field < sort_value) | (
            (field == sort_value) & (model.id < self.id_value)
        )

    def has_next_previous_page(self, *conditions, elements, selection):
        """Determine whether a previous/next page exists by checking, relative to
        the first/last element of the current page, whether any row comes before/
        after it in the established sort order (not just by `id`).
        """
        model = selection.model
        edge = elements[0] if self.forwards else elements[-1]

        if self.order_by_field is None:
            if self.forwards:
                base_condition = model.id < edge.id
            else:
                base_condition = model.id > edge.id
        else:
            field = self.order_by_field
            edge_value = getattr(edge, field.name)

            # For forward pagination we ask: does anything sort BEFORE `edge`
            # (i.e. would belong on a previous page)? For backward pagination,
            # the inverse.
            want_before = self.forwards != self.is_descending
            # "before" in result order means the opposite direction of "greater"
            # used in pagination_condition.
            if want_before:
                base_condition = (field < edge_value) | (
                    (field == edge_value) & (model.id < edge.id)
                )
            else:
                base_condition = (field > edge_value) | (
                    (field == edge_value) & (model.id > edge.id)
                )

        return selection.where(base_condition, *conditions).get_or_none() is not None

    def _encode_cursor(self, element):
        """Encode the element's id (and, if given, the value of the field results are
        sorted by) into a cursor string.
        """
        if self.order_by_field is None:
            payload = f"{element.id:08}"
        else:
            value = getattr(element, self.order_by_field.name)
            payload = f"{element.id:08}|{value}"
        return base64.b64encode(payload.encode()).decode()


def _generate_page_info(*conditions, elements, cursor, limit, **kwargs):
    """Generate pagination information from given elements and page limit. The elements
    comprise the current page and possibly the first element of the next/previous page.
    During forward/backward pagination, the following applies: If the number of elements
    exceeds the limit, a next/previous page exists. Determining whether a previous/next
    page exists is delegated to `Cursor.has_next_previous_page()`, passing `kwargs`.
    Derive cursors from the page's last/first elements.
    Return default PageInfo if no elements given (next/previous page cannot be
    determined efficiently even if existing). This is an edge case because it implies
    that the user e.g. ignored hasNextPage=False and requested the next page anyways.
    """
    info = PageInfo()
    if not elements:
        return info

    has_next_previous_page = cursor.has_next_previous_page(
        *conditions, elements=elements, **kwargs
    )
    if cursor.forwards:
        info.has_previous_page = has_next_previous_page
        info.start_cursor = cursor.encode(elements[0])
        if len(elements) > limit:
            info.has_next_page = True
            info.end_cursor = cursor.encode(elements[-2])
        else:
            info.end_cursor = cursor.encode(elements[-1])

    else:
        info.has_next_page = has_next_previous_page
        info.end_cursor = cursor.encode(elements[-1])
        if len(elements) > limit:
            info.has_previous_page = True
            info.start_cursor = cursor.encode(elements[1])
        else:
            info.start_cursor = cursor.encode(elements[0])

    return info


def _compute_total_count(*conditions, selection):
    """Compute total count, taking given conditions and model selection into account."""
    if conditions:
        selection = selection.where(*conditions)
    return selection.count()


def generate_page(*conditions, elements, cursor, selection, **page_info_kwargs):
    """Return a GraphQL Page type wrapping the given elements, and including appropriate
    page info.
    """
    page_info = _generate_page_info(
        *conditions,
        elements=elements,
        cursor=cursor,
        selection=selection,
        **page_info_kwargs,
    )
    page = {
        "page_info": page_info,
        "total_count": _compute_total_count(*conditions, selection=selection),
    }

    if cursor.forwards:
        page["elements"] = elements[:-1] if page_info.has_next_page else elements
    else:
        page["elements"] = elements[1:] if page_info.has_previous_page else elements

    return page


def load_into_page(
    model,
    *conditions,
    selection=None,
    order_by_field=None,
    descending=False,
    pagination_input,
):
    """High-level convenience function to load result query of given model into a
    GraphQL page type.
    The query is constructed from the given selection (default: `model.select()`), and
    optional conditions. The query results are ordered by the given field (default:
    model ID).
    """
    cursor, limit = pagination_parameters(pagination_input, order_by_field)
    pagination_condition = cursor.pagination_condition(model)

    if selection is None:
        selection = model.select()
    if order_by_field:
        order_by_field = order_by_field.desc() if descending else order_by_field.asc()
    query_result = (
        selection.where(pagination_condition, *conditions)
        .order_by(order_by_field or model.id, model.id)
        .limit(limit + 1)
    )
    return generate_page(
        *conditions,
        elements=list(query_result.iterator()),
        cursor=cursor,
        limit=limit,
        selection=selection,
    )
