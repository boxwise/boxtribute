from ariadne import QueryType

from ....authz import authorize
from ....models.definitions.size import Size
from ....models.definitions.size_range import SizeRange

query = QueryType()


@query.field("sizeRanges")
def resolve_size_ranges(*_):
    authorize(permission="size_range:read")
    return SizeRange.select()


@query.field("sizes")
def resolve_sizes(*_):
    authorize(permission="size:read")
    return Size.select(Size.id, Size.label)
