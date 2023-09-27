from ariadne import QueryType

from ....authz import authorize, authorized_bases_filter
from ....graph_ql.pagination import load_into_page
from ....models.definitions.product import Product

query = QueryType()


@query.field("products")
def resolve_products(*_, pagination_input=None):
    return load_into_page(
        Product,
        authorized_bases_filter(Product),
        pagination_input=pagination_input,
    )


@query.field("product")
def resolve_product(*_, id):
    product = Product.get_by_id(id)
    authorize(permission="product:read", base_id=product.base_id)
    return product
