"""Utility functions for pagination."""
import base64


class PageInfo:
    """Container for pagination information."""

    def __init__(self, *, has_next_page=False, start_cursor=None):
        self.has_next_page = has_next_page
        self.start_cursor = start_cursor


def pagination_parameters(pagination_input):
    """Retrieve cursor and limit (default: None and 50, resp.) from the given pagination
    input dictionary.
    """
    limit = 50
    if pagination_input is None:
        return None, limit
    return pagination_input.get("cursor"), pagination_input.get("limit", limit)


def decode_cursor(model, cursor):
    """Decode given cursor (a base64-encoded string) into a condition that can be
    plugged into a ModelSelect.where() clause for the given model.
    The cursor serves as a start value for the query (default: 1).
    """
    start_value = 1 if cursor is None else int(base64.b64decode(cursor))
    return model.id >= start_value


def _generate_page_info(*, elements, limit):
    """Generate pagination information from given elements and page limit. The elements
    comprise the current page and possibly the first element of the next page.
    If the size of the elements exceeds the limits, a next page exists.
    The cursor for the next page is derived from the ID of the last element: the ID is
    zero-padded to a byte-string of length 8, and then base64-encoded.
    """
    info = PageInfo()
    if len(elements) > limit:
        info.has_next_page = True
        info.start_cursor = base64.b64encode(f"{elements[-1].id:08}".encode()).decode()
    return info


def generate_page(*, elements, limit):
    """Return a GraphQL Page type wrapping the given elements, and including appropriate
    page info.
    """
    page_info = _generate_page_info(elements=elements, limit=limit)
    return {
        "elements": elements[:-1] if page_info.has_next_page else elements,
        "page_info": page_info,
    }
