from ariadne import ObjectType

from .crud import (
    compute_number_of_beneficiaries_served,
    compute_number_of_families_served,
    compute_number_of_sales,
)

metrics = ObjectType("Metrics")


@metrics.field("numberOfFamiliesServed")
def resolve_metrics_number_of_families_served(metrics_obj, _, after=None, before=None):
    return compute_number_of_families_served(
        organisation_id=metrics_obj["organisation_id"], after=after, before=before
    )


@metrics.field("numberOfBeneficiariesServed")
def resolve_metrics_number_of_beneficiaries_served(
    metrics_obj, _, after=None, before=None
):
    return compute_number_of_beneficiaries_served(
        organisation_id=metrics_obj["organisation_id"], after=after, before=before
    )


@metrics.field("numberOfSales")
def resolve_metrics_number_of_sales(metrics_obj, _, after=None, before=None):
    return compute_number_of_sales(
        organisation_id=metrics_obj["organisation_id"], after=after, before=before
    )
