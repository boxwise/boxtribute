from ariadne import QueryType

from ....authz import authorize, authorize_for_reading_box
from ....graph_ql.filtering import derive_box_filter
from ....graph_ql.pagination import load_into_page
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


@query.field("boxes")
def resolve_boxes(*_, base_id, pagination_input=None, filter_input=None):
    authorize(permission="stock:read", base_id=base_id)

    selection = Box.select().join(
        Location,
        on=(
            (Box.location == Location.id)
            & (Location.base == base_id)
            & ((Box.deleted == 0) | (Box.deleted.is_null()))
        ),
    )
    filter_condition, selection = derive_box_filter(filter_input, selection=selection)

    return load_into_page(
        Box,
        filter_condition,
        selection=selection,
        pagination_input=pagination_input,
    )
