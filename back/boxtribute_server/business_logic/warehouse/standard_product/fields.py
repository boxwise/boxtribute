from ariadne import ObjectType

standard_product = ObjectType("StandardProduct")


@standard_product.field("category")
def resolve_standard_product_product_category(standard_product_obj, info):
    return info.context["product_category_loader"].load(
        standard_product_obj.category_id
    )


@standard_product.field("sizeRange")
def resolve_standard_product_size_range(standard_product_obj, info):
    return info.context["size_range_loader"].load(standard_product_obj.size_range_id)


@standard_product.field("gender")
def resolve_standard_product_gender(standard_product_obj, _):
    # Instead of a ProductGender instance return an integer for EnumType conversion
    return standard_product_obj.gender_id


@standard_product.field("addedBy")
def resolve_standard_product_added_by(standard_product_obj, info):
    return info.context["user_loader"].load(standard_product_obj.added_by_id)


@standard_product.field("deprecatedBy")
def resolve_standard_product_deprecated_by(standard_product_obj, info):
    return info.context["user_loader"].load(standard_product_obj.deprecated_by_id)
