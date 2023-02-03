from ariadne import QueryType, convert_kwargs_to_snake_case

from ....authz import authorize
from ....models.definitions.box import Box
from ....models.definitions.location import Location

query = QueryType()


@query.field("box")
@convert_kwargs_to_snake_case
def resolve_box(*_, label_identifier):
    box = (
        Box.select(Box, Location)
        .join(Location)
        .where(Box.label_identifier == label_identifier)
        .get()
    )
    authorize(permission="stock:read", base_id=box.location.base_id)
    return box
