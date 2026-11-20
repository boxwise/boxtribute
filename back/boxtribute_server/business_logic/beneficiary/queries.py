from ariadne import ObjectType, QueryType

from ...authz import authorize, authorized_bases_filter
from ...graph_ql.filtering import derive_beneficiary_filter
from ...graph_ql.pagination import load_into_page
from ...models.definitions.beneficiary import Beneficiary
from .crud import get_beneficiaries_page

query = QueryType()
beneficiary_row = ObjectType("BeneficiaryRow")


@query.field("beneficiary")
def resolve_beneficiary(*_, id):
    beneficiary = Beneficiary.get_by_id(id)
    authorize(permission="beneficiary:read", base_id=beneficiary.base_id)
    return beneficiary


@query.field("beneficiaries")
def resolve_beneficiaries(*_, pagination_input=None, filter_input=None):
    conditions, selection = derive_beneficiary_filter(filter_input)
    return load_into_page(
        Beneficiary,
        authorized_bases_filter(Beneficiary),
        *conditions,
        selection=selection,
        pagination_input=pagination_input,
    )


@query.field("beneficiaryRows")
def resolve_beneficiary_rows(*_, base_id, options=None):
    authorize(permission="base:read", base_id=base_id)
    authorize(permission="beneficiary:read", base_id=base_id)
    authorize(permission="tag:read", base_id=base_id)
    authorize(permission="tags_relation:read")
    authorize(permission="transaction:read")
    return get_beneficiaries_page(base_id, **(options or {}))


@beneficiary_row.field("tagIds")
def resolve_beneficiary_row_tag_ids(row, _):
    tag_ids = row["tag_ids"]
    return [int(i) for i in tag_ids.split(",")] if tag_ids else []
