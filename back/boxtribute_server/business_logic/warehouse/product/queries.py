from ariadne import QueryType

from ....authz import authorize, authorized_bases_filter
from ....graph_ql.pagination import load_into_page
from ....models.definitions.product import Product

query = QueryType()


@query.field("products")
def resolve_products(*_, base_id=None, pagination_input=None):
    conditions = [authorized_bases_filter(Product)]
    if base_id is not None:
        conditions.append(Product.base == base_id)
    return load_into_page(
        Product,
        *conditions,
        pagination_input=pagination_input,
    )


@query.field("product")
def resolve_product(*_, id):
    product = Product.get_by_id(id)
    authorize(permission="product:read", base_id=product.base_id)
    return product
