from ariadne import QueryType

from .crud import compute_beneficiary_demographics, compute_created_boxes

query = QueryType()


@query.field("beneficiaryDemographics")
def resolve_beneficiary_demographics(*_, base_ids=None):
    return compute_beneficiary_demographics(base_ids)


@query.field("createdBoxes")
def resolve_created_boxes(*_, base_id=None):
    return compute_created_boxes(base_id)
