from ariadne import QueryType

from ....authz import authorize, handle_unauthorized
from ....graph_ql.pagination import load_into_page
from ....models.definitions.standard_product import StandardProduct
from ....models.utils import handle_non_existing_resource

query = QueryType()


class StandardProductPage(dict):
    pass


@query.field("standardProducts")
@handle_unauthorized
def resolve_standard_products(*_):
    authorize(permission="standard_product:read")
    # Resolve dict returned from load_into_page() to GraphQL type
    return StandardProductPage(
        **load_into_page(
            StandardProduct,
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
