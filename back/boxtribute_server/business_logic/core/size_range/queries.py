from ariadne import QueryType

from ....authz import authorize
from ....models.definitions.size_range import SizeRange

query = QueryType()


@query.field("sizeRanges")
def resolve_size_ranges(*_):
    authorize(permission="size_range:read")
    return SizeRange.select()
