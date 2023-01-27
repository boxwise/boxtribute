from ariadne import ObjectType

from .crud import (
    compute_moved_stock_overview,
    compute_number_of_beneficiaries_served,
    compute_number_of_families_served,
    compute_number_of_sales,
    compute_stock_overview,
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


@metrics.field("stockOverview")
def resolve_metrics_stock_overview(metrics_obj, _):
    return compute_stock_overview(organisation_id=metrics_obj["organisation_id"])


@metrics.field("movedStockOverview")
def resolve_metrics_moved_stock_overview(metrics_obj, _, after=None, before=None):
    return compute_moved_stock_overview(
        organisation_id=metrics_obj["organisation_id"], after=after, before=before
    )
