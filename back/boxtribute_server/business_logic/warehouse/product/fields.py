from ariadne import ObjectType

from ....authz import authorize

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
def resolve_product_base(product_obj, _):
    authorize(permission="base:read", base_id=product_obj.base_id)
    return product_obj.base
