from ....db import db
from ....models.definitions.product import Product
from ....models.utils import utcnow


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
