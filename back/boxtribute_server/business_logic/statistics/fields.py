import urllib.parse as up

from ariadne import ObjectType

from ...enums import ShareableView
from ...models.definitions.base import Base
from ...models.definitions.organisation import Organisation
from .crud import (
    compute_beneficiary_demographics,
    compute_created_boxes,
    compute_moved_boxes,
    compute_stock_overview,
)

resolved_link = ObjectType("ResolvedLink")


@resolved_link.field("data")
def resolve_resolved_link_data(resolved_link_obj, _):
    if resolved_link_obj.view == ShareableView.StatvizDashboard:
        return [
            compute_beneficiary_demographics(resolved_link_obj.base_id),
            compute_created_boxes(resolved_link_obj.base_id),
            compute_moved_boxes(resolved_link_obj.base_id),
            compute_stock_overview(resolved_link_obj.base_id),
        ]

    elif resolved_link_obj.view == ShareableView.StockOverview:
        tag_ids = None
        # parse_qs returns empty dict if url_parameters is None
        raw_tag_ids = up.parse_qs(resolved_link_obj.url_parameters).get("tags")
        if raw_tag_ids:
            # parse_qs returns a list with one element; decode the IDs
            tag_ids = [int(i) for i in raw_tag_ids[0].split(",")]
        return [compute_stock_overview(resolved_link_obj.base_id, tag_ids=tag_ids)]

    else:  # pragma: no cover
        raise ValueError("Invalid value for ShareableView")


@resolved_link.field("baseName")
async def resolve_resolved_link_base_name(resolved_link_obj, _):
    return Base.get_by_id(resolved_link_obj.base_id).name


@resolved_link.field("organisationName")
async def resolve_resolved_link_organisation_name(resolved_link_obj, _):
    organisation = (
        Base.select(Organisation.name)
        .join(Organisation)
        .where(Base.id == resolved_link_obj.base_id)
        .objects()
        .get()
    )
    return organisation.name
