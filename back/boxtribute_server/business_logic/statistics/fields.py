from ariadne import ObjectType

from .crud import (
    compute_beneficiary_demographics,
    compute_created_boxes,
    compute_moved_boxes,
    compute_stock_overview,
)

resolved_link = ObjectType("ResolvedLink")


@resolved_link.field("data")
def resolve_resolved_link_data(resolved_link_obj, _):
    return [
        compute_beneficiary_demographics(resolved_link_obj.base_id),
        compute_created_boxes(resolved_link_obj.base_id),
        compute_moved_boxes(resolved_link_obj.base_id),
        compute_stock_overview(resolved_link_obj.base_id),
    ]
