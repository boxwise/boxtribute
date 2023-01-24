from ariadne import QueryType

from ....authz import authorize
from ....models.definitions.product_category import ProductCategory

query = QueryType()


@query.field("productCategory")
def resolve_product_category(*_, id):
    authorize(permission="category:read")
    return ProductCategory.get_by_id(id)


@query.field("productCategories")
def resolve_product_categories(*_):
    authorize(permission="category:read")
    return ProductCategory.select()
