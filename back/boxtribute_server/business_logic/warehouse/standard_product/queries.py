from ariadne import QueryType
from peewee import JOIN, fn

from ....authz import authorize, handle_unauthorized
from ....db import use_db_replica
from ....graph_ql.pagination import load_into_page
from ....models.definitions.product import Product
from ....models.definitions.product_category import ProductCategory
from ....models.definitions.size_range import SizeRange
from ....models.definitions.standard_product import StandardProduct
from ....models.utils import handle_non_existing_resource

query = QueryType()
public_query = QueryType()


class StandardProductPage(dict):
    pass


@query.field("standardProducts")
@handle_unauthorized
def resolve_standard_products(*_, base_id=None):
    authorize(permission="standard_product:read", base_id=base_id)

    selection = StandardProduct.select()
    # Always include all standard products of newest version
    condition = StandardProduct.version == StandardProduct.select(
        fn.MAX(StandardProduct.version)
    )

    # If base ID given, include all standard products enabled for that base
    if base_id is not None:
        selection = StandardProduct.select(StandardProduct, Product).join(
            Product,
            JOIN.LEFT_OUTER,
            on=(
                (StandardProduct.id == Product.standard_product)
                & (Product.base == base_id)
                & (Product.deleted_on.is_null())
            ),
        )
        condition |= Product.base == base_id

    # Resolve dict returned from load_into_page() to GraphQL type
    return StandardProductPage(
        **load_into_page(
            StandardProduct,
            condition,
            selection=selection,
            # No pagination input in query definition; use large default
            pagination_input={"first": 1000},
        )
    )


@query.field("standardProduct")
@handle_unauthorized
@handle_non_existing_resource
def resolve_standard_product(*_, id):
    authorize(permission="standard_product:read")
    standard_product = StandardProduct.get_by_id(id)
    return standard_product


@public_query.field("standardProducts")
@use_db_replica
def resolve_public_standard_products(*_):
    return (
        StandardProduct.select(
            StandardProduct.id,
            StandardProduct.name,
            ProductCategory.name.alias("category_name"),
            SizeRange.label.alias("size_range_name"),
            StandardProduct.gender,
            StandardProduct.version,
        )
        .join(ProductCategory)
        .join(SizeRange, src=StandardProduct)
        .dicts()
        .iterator()
    )
