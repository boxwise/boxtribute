from ariadne import ObjectType

from ....authz import authorize
from ....enums import LocationType, TaggableObjectType, TagType
from ....graph_ql.filtering import derive_beneficiary_filter, derive_product_filter
from ....graph_ql.pagination import load_into_page
from ....models.definitions.beneficiary import Beneficiary
from ....models.definitions.location import Location
from ....models.definitions.product import Product
from ....models.definitions.tag import Tag

base = ObjectType("Base")


@base.field("organisation")
def resolve_base_organisation(base_obj, info):
    return info.context["organisation_loader"].load(base_obj.organisation_id)


@base.field("products")
def resolve_base_products(base_obj, _, filter_input=None):
    authorize(permission="product:read", base_id=base_obj.id)
    conditions = derive_product_filter(filter_input)
    return Product.select().where(Product.base == base_obj.id, *conditions)


@base.field("locations")
def resolve_base_locations(base_obj, _):
    authorize(permission="location:read", base_id=base_obj.id)
    return Location.select().where(
        Location.base == base_obj.id,
        Location.type == LocationType.ClassicLocation,
        Location.deleted_on.is_null(),
    )


@base.field("tags")
def resolve_base_tags(base_obj, _, resource_type=None):
    authorize(permission="tag:read", base_id=base_obj.id)

    filter_condition = True
    if resource_type == TaggableObjectType.Box:
        filter_condition = Tag.type << [TagType.Box, TagType.All]
    elif resource_type == TaggableObjectType.Beneficiary:
        filter_condition = Tag.type << [TagType.Beneficiary, TagType.All]

    return Tag.select().where(
        Tag.base == base_obj.id, Tag.deleted_on.is_null(), filter_condition
    )


@base.field("beneficiaries")
def resolve_base_beneficiaries(base_obj, _, pagination_input=None, filter_input=None):
    authorize(permission="beneficiary:read", base_id=base_obj.id)
    base_filter_condition = Beneficiary.base == base_obj.id
    filter_condition = base_filter_condition & derive_beneficiary_filter(filter_input)
    return load_into_page(
        Beneficiary, filter_condition, pagination_input=pagination_input
    )


@base.field("instockBoxesCount")
def resolve_base_instock_boxes_count(base_obj, info):
    return info.context["instock_boxes_count_for_base_loader"].load(base_obj.id)


@base.field("instockItemsCount")
def resolve_base_instock_items_count(base_obj, info):
    return info.context["instock_items_count_for_base_loader"].load(base_obj.id)
