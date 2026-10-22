from ariadne import ObjectType, QueryType

from ....authz import authorize, authorize_for_accessing_box
from ....graph_ql.filtering import derive_box_filter
from ....graph_ql.pagination import load_into_page
from ....models.definitions.box import Box
from ....models.definitions.location import Location
from .crud import get_boxes_page

box_row = ObjectType("BoxRow")
query = QueryType()


@query.field("box")
def resolve_box(*_, label_identifier):
    box = (
        Box.select(Box, Location)
        .join(Location)  # for box.location attribute in authorize_for_accessing_box()
        .where(Box.label_identifier == label_identifier)
        .get()
    )
    authorize_for_accessing_box(box)
    return box


@query.field("boxes")
def resolve_boxes(*_, base_id, pagination_input=None, filter_input=None):
    authorize(permission="stock:read", base_id=base_id)

    selection = Box.select().join(
        Location,
        on=(
            (Box.location == Location.id)
            & (Location.base == base_id)
            & ((Box.deleted_on == 0) | (Box.deleted_on.is_null()))
        ),
    )
    filter_condition, selection = derive_box_filter(filter_input, selection=selection)

    return load_into_page(
        Box,
        filter_condition,
        selection=selection,
        order_by_field=Box.last_modified_on.desc(),
        pagination_input=pagination_input,
    )


@query.field("boxRows")
def resolve_box_rows(*_, base_id, options=None):
    options = options or {
        "page": None,
        "page_size": None,
        "filters": None,
        "sort_by": None,
        "descending": False,
    }
    # TODO: add authorize(permission="stock:read", base_id=base_id)
    result = get_boxes_page(base_id, **options)
    return result


@box_row.field("tagIds")
def resolve_box_row_tag_ids(row, _):
    tag_ids = row["tag_ids"]
    return [int(i) for i in tag_ids.split(",")] if tag_ids else []
