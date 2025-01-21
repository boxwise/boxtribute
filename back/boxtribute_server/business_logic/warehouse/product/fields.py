from ariadne import ObjectType

from ....authz import authorize
from ....enums import ProductType

product = ObjectType("Product")


@product.field("category")
def resolve_product_product_category(product_obj, info):
    return info.context["product_category_loader"].load(product_obj.category_id)


@product.field("sizeRange")
def resolve_product_size_range(product_obj, info):
    return info.context["size_range_loader"].load(product_obj.size_range_id)


@product.field("gender")
def resolve_product_gender(product_obj, _):
    # Instead of a ProductGender instance return an integer for EnumType conversion
    return product_obj.gender_id


@product.field("base")
def resolve_product_base(product_obj, info):
    authorize(permission="base:read", base_id=product_obj.base_id)
    return info.context["base_loader"].load(product_obj.base_id)


@product.field("type")
def resolve_product_type(product_obj, _):
    if product_obj.standard_product_id is None:
        return ProductType.Custom
    return ProductType.StandardInstantiation


@product.field("instockItemsCount")
def resolve_instock_items_count(product_obj, info):
    return info.context["instock_items_count_for_product_loader"].load(product_obj.id)


@product.field("createdBy")
def resolve_product_created_by(product_obj, info):
    return info.context["user_loader"].load(product_obj.created_by_id)


@product.field("lastModifiedBy")
def resolve_product_last_modified_by(product_obj, info):
    return info.context["user_loader"].load(product_obj.last_modified_by_id)
