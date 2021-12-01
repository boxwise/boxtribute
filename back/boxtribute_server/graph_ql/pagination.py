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

import peewee


class PageInfo:
    """Container for pagination information."""

    def __init__(self):
        self.has_previous_page = False
        self.has_next_page = False
        self.start_cursor = ""
        self.end_cursor = ""


def pagination_parameters(pagination_input):
    """Retrieve cursor and limit (default: Cursor() and 50, resp.) from the given
    pagination input dictionary.
    The values of `after`/`first` take precedence over `before`/`last`.
    """
    limit = 50
    if pagination_input is None:
        return Cursor(), limit

    after_value = pagination_input.get("after")
    first = pagination_input.get("first")
    if after_value is not None or first is not None:
        return Cursor(after_value), first or limit

    return Cursor(pagination_input.get("before"), forwards=False), pagination_input.get(
        "last", limit
    )


class Cursor:
    """Representation of pagination cursor, translating from GraphQL to data layer."""

    def __init__(self, value=None, forwards=True):
        """Decode and store value (a base64-encoded string).
        The value serves as point to start a select query after/before (default: 0 for
        forward pagination, +infinity otherwise).
        Assume forward pagination by default.
        """
        default_value = 0 if forwards else peewee.Value("infinity")
        self.value = default_value if value is None else int(base64.b64decode(value))
        self.forwards = forwards

    def pagination_condition(self, model):
        """Convert internal value into a condition that can be plugged into a
        ModelSelect.where() clause for the given model.
        """
        if self.forwards:
            return model.id > self.value
        return model.id < self.value

    def has_next_previous_page(self, *conditions, elements, selection):
        """For forward/backward pagination, determine whether a previous/next page
        exists (i.e. if the model holds elements before the first / after the last one).
        To this end, the given model selection is used (might contain joins required by
        conditions).
        Additional conditions, e.g. for filtering, are taken into account.
        """
        model = selection.model
        if self.forwards:
            base_condition = model.id < elements[0].id
        else:
            base_condition = model.id > elements[-1].id

        for condition in conditions:
            base_condition = (base_condition) & (condition)
        return selection.where(base_condition).get_or_none() is not None


def _encode_id(element):
    """Zero-pad the element's ID to a byte-string of length 8, and base64-encode it.
    Return encoded result as unicode string.
    """
    return base64.b64encode(f"{element.id:08}".encode()).decode()


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
        info.start_cursor = _encode_id(elements[0])
        if len(elements) > limit:
            info.has_next_page = True
            info.end_cursor = _encode_id(elements[-2])
        else:
            info.end_cursor = _encode_id(elements[-1])

    else:
        info.has_next_page = has_next_previous_page
        info.end_cursor = _encode_id(elements[-1])
        if len(elements) > limit:
            info.has_previous_page = True
            info.start_cursor = _encode_id(elements[1])
        else:
            info.start_cursor = _encode_id(elements[0])

    return info


def _compute_total_count(*conditions, selection):
    """Compute total count, taking given conditions and model selection into account."""
    base_condition = True
    for condition in conditions:
        base_condition = (base_condition) & (condition)
    return selection.where(base_condition).count()


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


def load_into_page(model, *conditions, selection=None, pagination_input):
    """High-level convenience function to load result query of given model into a
    GraphQL page type.
    The query is constructed from the given selection (default: `model.select()`), and
    optional conditions. The query results are ordered by model ID.
    """
    cursor, limit = pagination_parameters(pagination_input)
    pagination_condition = cursor.pagination_condition(model)
    for condition in conditions:
        pagination_condition = (condition) & (pagination_condition)

    selection = selection or model.select()
    query_result = (
        selection.where(pagination_condition).order_by(model.id).limit(limit + 1)
    )
    return generate_page(
        *conditions,
        elements=query_result,
        cursor=cursor,
        limit=limit,
        selection=selection,
    )
