from ariadne import ObjectType

from ....authz import authorize
from ....graph_ql.filtering import derive_box_filter
from ....graph_ql.pagination import load_into_page
from ....models.definitions.box import Box
from ....models.definitions.product import Product

classic_location = ObjectType("ClassicLocation")


@classic_location.field("defaultBoxState")
def resolve_location_default_box_state(location_obj, _):
    # Instead of a BoxState instance return an integer for EnumType conversion
    return location_obj.box_state_id


@classic_location.field("boxes")
def resolve_location_boxes(location_obj, _, pagination_input=None, filter_input=None):
    authorize(permission="stock:read", base_id=location_obj.base_id)
    location_filter_condition = Box.location == location_obj.id
    filter_condition = location_filter_condition & derive_box_filter(filter_input)
    selection = Box.select()
    if filter_input is not None and any(
        [f in filter_input for f in ["product_gender", "product_category_id"]]
    ):
        selection = Box.select().join(Product)
    return load_into_page(
        Box, filter_condition, selection=selection, pagination_input=pagination_input
    )


@classic_location.field("base")
def resolve_location_base(location_obj, _):
    authorize(permission="base:read", base_id=location_obj.base_id)
    return location_obj.base
