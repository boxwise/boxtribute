from ....db import db
from ....errors import InvalidPrice
from ....models.definitions.product import Product
from ....models.utils import (
    handle_non_existing_resource,
    save_creation_to_history,
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
    price=0,
    name=None,
    comment=None,
    in_shop=False,
):
    if price < 0:
        return InvalidPrice(value=price)

    product = Product()
    product.base = base_id
    product.category = category_id
    product.comment = comment
    product.created_on = utcnow()
    product.created_by = user_id
    product.gender = gender
    product.name = name or ""
    product.size_range = size_range_id
    product.in_shop = in_shop
    product.price = price
    with db.database.atomic():
        product.save()
        return product
