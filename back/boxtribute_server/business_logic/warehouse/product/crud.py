from ....db import db
from ....errors import BoxesStillAssignedToProduct, EmptyName, InvalidPrice
from ....models.definitions.box import Box
from ....models.definitions.product import Product
from ....models.utils import (
    handle_non_existing_resource,
    save_creation_to_history,
    save_deletion_to_history,
    save_update_to_history,
    utcnow,
)


@save_creation_to_history
@handle_non_existing_resource
def create_custom_product(
    *,
    user_id,
    category_id,
    size_range_id,
    gender,
    base_id,
    name,
    price=0,
    comment=None,
    in_shop=False,
):
    if price < 0:
        return InvalidPrice(value=price)

    if not name:
        return EmptyName()

    product = Product()
    product.base = base_id
    product.category = category_id
    product.comment = comment
    product.created_on = utcnow()
    product.created_by = user_id
    product.gender = gender
    product.name = name
    product.size_range = size_range_id
    product.in_shop = in_shop
    product.price = price
    with db.database.atomic():
        product.save()
        return product


@save_update_to_history(
    fields=[
        Product.category,
        Product.size_range,
        Product.gender,
        Product.name,
        Product.price,
        Product.comment,
    ]
)
@handle_non_existing_resource
def edit_custom_product(
    *,
    id,  # required for save_update_to_history
    product,
    user_id,
    category_id=None,
    size_range_id=None,
    gender=None,
    name=None,
    price=None,
    comment=None,
    in_shop=None,
):
    if name is not None:
        if not name:
            return EmptyName()
        product.name = name

    if category_id is not None:
        product.category = category_id

    if size_range_id is not None:
        product.size_range = size_range_id

    if gender is not None:
        product.gender = gender

    if price is not None:
        if price < 0:
            return InvalidPrice(value=price)
        product.price = price

    if comment is not None:
        product.comment = comment

    if in_shop is not None:
        product.in_shop = in_shop

    product.last_modified_on = utcnow()
    product.last_modified_by = user_id
    product.save()

    return product


def _boxes_still_assigned_to_product(product):
    return [
        box.label_identifier
        for box in Box.select(Box.label_identifier).where(
            Box.product == product.id,
            (Box.deleted.is_null()) | (Box.deleted == 0),
        )
    ]


@save_deletion_to_history
@handle_non_existing_resource
def delete_product(*, user_id, product):
    if label_identifiers := _boxes_still_assigned_to_product(product):
        return BoxesStillAssignedToProduct(label_identifiers=label_identifiers)

    now = utcnow()
    product.deleted_on = now
    product.last_modified_on = now
    product.last_modified_by = user_id
    product.save()

    return product
