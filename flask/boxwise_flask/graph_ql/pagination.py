"""Utility functions for pagination."""
import base64

import peewee


class PageInfo:
    """Container for pagination information."""

    def __init__(
        self,
        *,
        has_previous_page=False,
        has_next_page=False,
        start_cursor=None,
        end_cursor=None,
    ):
        self.has_previous_page = has_previous_page
        self.has_next_page = has_next_page
        self.start_cursor = start_cursor
        self.end_cursor = end_cursor


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


def _encode_id(element):
    """Zero-pad the element's ID to a byte-string of length 8, and base64-encode it.
    Return encoded result as unicode string.
    """
    return base64.b64encode(f"{element.id:08}".encode()).decode()


def _generate_page_info(*, elements, cursor, limit):
    """Generate pagination information from given elements and page limit. The elements
    comprise the current page and possibly the first element of the next/previous page.
    During forward pagination, the following applies (for backward pagination, swap
    next/previous, first/last, and before/after)
    If the number of elements exceeds the limit, a next page exists.
    If the elements' model contains any rows before the first element, a previous page
    exists.
    Derive cursors from the page's last/first elements.
    Return default PageInfo if no elements given (next/previous page cannot be
    determined efficiently even if existing). This is an edge case because it implies
    that the user e.g. ignored hasNextPage=False and requested the next page anyways.
    """
    info = PageInfo()
    if not elements:
        return info

    model = type(elements[0])
    if cursor.forwards:
        info.start_cursor = _encode_id(elements[0])
        if len(elements) > limit:
            info.has_next_page = True
            info.end_cursor = _encode_id(elements[-2])

        if model.select().where(model.id < elements[0].id).get_or_none() is not None:
            info.has_previous_page = True

    else:
        info.end_cursor = _encode_id(elements[-1])
        if len(elements) > limit:
            info.has_previous_page = True
            info.start_cursor = _encode_id(elements[1])

        if model.select().where(model.id > elements[-1].id).get_or_none() is not None:
            info.has_next_page = True

    return info


def generate_page(*, elements, cursor, limit):
    """Return a GraphQL Page type wrapping the given elements, and including appropriate
    page info.
    """
    page_info = _generate_page_info(elements=elements, cursor=cursor, limit=limit)
    page = {"page_info": page_info}

    if cursor.forwards:
        page["elements"] = elements[:-1] if page_info.has_next_page else elements
    else:
        page["elements"] = elements[1:] if page_info.has_previous_page else elements

    return page
