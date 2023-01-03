from ariadne import QueryType, convert_kwargs_to_snake_case

from ..authz import authorize, authorized_bases_filter
from ..graph_ql.filtering import derive_beneficiary_filter
from ..graph_ql.pagination import load_into_page
from ..models.definitions.beneficiary import Beneficiary

query = QueryType()


@query.field("beneficiary")
def resolve_beneficiary(*_, id):
    beneficiary = Beneficiary.get_by_id(id)
    authorize(permission="beneficiary:read", base_id=beneficiary.base_id)
    return beneficiary


@query.field("beneficiaries")
@convert_kwargs_to_snake_case
def resolve_beneficiaries(*_, pagination_input=None, filter_input=None):
    filter_condition = derive_beneficiary_filter(filter_input)
    return load_into_page(
        Beneficiary,
        authorized_bases_filter(Beneficiary) & filter_condition,
        pagination_input=pagination_input,
    )
