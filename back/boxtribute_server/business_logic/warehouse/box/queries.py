from ariadne import QueryType

from ....authz import authorize_for_reading_box
from ....models.definitions.box import Box
from ....models.definitions.location import Location

query = QueryType()


@query.field("box")
def resolve_box(*_, label_identifier):
    box = (
        Box.select(Box, Location)
        .join(Location)
        .where(Box.label_identifier == label_identifier)
        .get()
    )
    authorize_for_reading_box(box)
    return box
