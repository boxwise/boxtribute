from dataclasses import dataclass

from ....db import db
from ....enums import BoxState, ProductType
from ....errors import (
    BoxesStillAssignedToProduct,
    EmptyName,
    InvalidPrice,
    OutdatedStandardProductVersion,
    ProductTypeMismatch,
    StandardProductAlreadyEnabledForBase,
)
from ....models.definitions.box import Box
from ....models.definitions.history import DbChangeHistory
from ....models.definitions.product import Product
from ....models.definitions.standard_product import StandardProduct
from ....models.utils import (
    BATCH_SIZE,
    HISTORY_CREATION_MESSAGE,
    handle_non_existing_resource,
    safely_handle_deletion,
    save_creation_to_history,
    save_update_to_history,
    utcnow,
)


@dataclass(kw_only=True)
class ProductsResult:
    instantiations: list[Product]
    invalid_standard_product_ids: list[int]


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
    now,
):
    if price < 0:
        return InvalidPrice(value=price)

    if not name:
        return EmptyName()

    product = Product()
    product.base = base_id
    product.category = category_id
    product.comment = comment
    product.created_on = now
    product.created_by = user_id
    product.gender = gender
    product.name = name
    product.size_range = size_range_id
    product.in_shop = in_shop
    product.price = price
    with db.database.atomic():
        product.save()
        return product


@handle_non_existing_resource
@save_update_to_history(
    fields=[
        Product.category,
        Product.size_range,
        Product.gender,
        Product.name,
        Product.price,
        Product.comment,
        Product.in_shop,
    ]
)
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
    **_,  # swallow now parameter passed by save_update_to_history
):
    if product.standard_product_id is not None:
        return ProductTypeMismatch(expected_type=ProductType.Custom)

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

    return product


def _boxes_still_assigned_to_product(product):
    return [
        box.label_identifier
        for box in Box.select(Box.label_identifier).where(
            Box.product == product.id,
            (Box.deleted_on.is_null()) | (Box.deleted_on == 0),
            (
                Box.state
                << (
                    BoxState.InStock,
                    BoxState.MarkedForShipment,
                    BoxState.InTransit,
                    BoxState.Receiving,
                )
            ),
        )
    ]


@safely_handle_deletion
@handle_non_existing_resource
def delete_product(*, user_id, product, **_):
    if product.standard_product_id is not None:
        return ProductTypeMismatch(expected_type=ProductType.Custom)

    if label_identifiers := _boxes_still_assigned_to_product(product):
        return BoxesStillAssignedToProduct(label_identifiers=label_identifiers)

    return product


@save_creation_to_history
@handle_non_existing_resource
def enable_standard_product(
    *,
    user_id,
    standard_product_id,
    base_id,
    size_range_id=None,
    price=0,
    comment=None,
    in_shop=False,
    now,
):
    if price < 0:
        return InvalidPrice(value=price)

    if (
        product_id := Product.get_or_none(
            Product.base == base_id,
            Product.deleted_on.is_null(),
            Product.standard_product == standard_product_id,
        )
    ) is not None:
        return StandardProductAlreadyEnabledForBase(product_id=product_id)

    standard_product = StandardProduct.get_by_id(standard_product_id)

    if standard_product.superceded_by_product_id is not None:
        return OutdatedStandardProductVersion(standard_product.superceded_by_product_id)

    product = Product()
    product.base = base_id
    product.category = standard_product.category_id
    product.gender = standard_product.gender_id
    product.name = standard_product.name
    product.size_range = (
        standard_product.size_range_id if size_range_id is None else size_range_id
    )
    product.price = price
    product.comment = comment
    product.in_shop = in_shop
    product.created_on = now
    product.created_by = user_id
    product.standard_product = standard_product
    with db.database.atomic():
        product.save()
        return product


def enable_standard_products(
    *,
    user_id,
    standard_product_ids,
    base_id,
):
    """Enable multiple standard products for the specified base.
    Attributes for the product instantiations default to the values in the corresponding
    standard products. Log product instantiations in the history table.
    Return successfully instantianted products, and a list of IDs of invalid standard
    products (e.g. non-existing, already enabled for the base, and/or superceded by more
    recent standard product).
    """
    standard_product_ids = set(standard_product_ids)
    # Get all existing standard products not yet enabled in the specified base
    valid_standard_products = (
        StandardProduct.select()
        .left_outer_join(
            Product,
            on=(
                (StandardProduct.id == Product.standard_product)
                & (Product.base == base_id)
            ),
        )
        .where(
            StandardProduct.id << standard_product_ids,
            StandardProduct.superceded_by_product.is_null(),
            Product.base.is_null(),
        )
    )

    now = utcnow()
    product_instantiations = [
        Product(
            base=base_id,
            category=sp.category_id,
            gender=sp.gender_id,
            name=sp.name,
            size_range=sp.size_range_id,
            price=0,
            comment=None,
            in_shop=False,
            created_on=now,
            created_by=user_id,
            standard_product=sp,
        )
        for sp in valid_standard_products
    ]

    valid_standard_product_ids = {sp.id for sp in valid_standard_products}
    with db.database.atomic():
        Product.bulk_create(product_instantiations, batch_size=BATCH_SIZE)

        # Query again to obtain Product.id primary key
        product_instantiations = Product.select().where(
            Product.standard_product << valid_standard_product_ids,
            Product.base == base_id,
        )
        history_entries = [
            DbChangeHistory(
                changes=HISTORY_CREATION_MESSAGE,
                table_name=Product._meta.table_name,
                record_id=product.id,
                user=user_id,
                change_date=now,
            )
            for product in product_instantiations
        ]
        DbChangeHistory.bulk_create(history_entries, batch_size=BATCH_SIZE)

    return ProductsResult(
        instantiations=product_instantiations,
        invalid_standard_product_ids=sorted(
            standard_product_ids.difference(valid_standard_product_ids)
        ),
    )


@handle_non_existing_resource
@save_update_to_history(
    fields=[
        Product.size_range,
        Product.price,
        Product.comment,
        Product.in_shop,
    ],
)
def edit_standard_product_instantiation(
    *,
    id,  # required for save_update_to_history
    product,
    user_id,
    size_range_id=None,
    price=None,
    comment=None,
    in_shop=None,
    **_,
):
    if product.standard_product_id is None:
        return ProductTypeMismatch(expected_type=ProductType.StandardInstantiation)

    if size_range_id is not None:
        product.size_range = size_range_id

    if price is not None:
        if price < 0:
            return InvalidPrice(value=price)
        product.price = price

    if comment is not None:
        product.comment = comment

    if in_shop is not None:
        product.in_shop = in_shop

    return product


@safely_handle_deletion
@handle_non_existing_resource
def disable_standard_product(*, user_id, product, **_):
    if product.standard_product_id is None:
        return ProductTypeMismatch(expected_type=ProductType.StandardInstantiation)

    if label_identifiers := _boxes_still_assigned_to_product(product):
        return BoxesStillAssignedToProduct(label_identifiers=label_identifiers)

    return product
