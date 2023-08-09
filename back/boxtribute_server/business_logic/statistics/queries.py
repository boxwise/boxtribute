from ariadne import QueryType

from .crud import compute_beneficiary_demographics

query = QueryType()


@query.field("beneficiaryDemographics")
def resolve_beneficiary_demographics(*_, base_ids):
    return compute_beneficiary_demographics(base_ids)
