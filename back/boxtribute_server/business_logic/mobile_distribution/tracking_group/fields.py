from ariadne import ObjectType

from ....authz import authorize
from ....models.definitions.distribution_event import DistributionEvent
from ....models.definitions.distribution_event_tracking_log_entry import (
    DistributionEventTrackingLogEntry,
)

distribution_events_tracking_group = ObjectType("DistributionEventsTrackingGroup")


@distribution_events_tracking_group.field("distributionEventsTrackingEntries")
def resolve_distribution_events_tracking_group_tracking_entries(tracking_group_obj, _):
    authorize(
        permission="distro_event:read",
        base_id=tracking_group_obj.base_id,
    )
    return DistributionEventTrackingLogEntry.select().where(
        (
            DistributionEventTrackingLogEntry.distro_event_tracking_group_id
            == tracking_group_obj.id
        )
    )


@distribution_events_tracking_group.field("distributionEvents")
def resolve_distribution_events_tracking_group_distribution_events(
    tracking_group_obj, _
):
    authorize(
        permission="distro_event:read",
        base_id=tracking_group_obj.base_id,
    )
    return DistributionEvent.select().where(
        (DistributionEvent.distro_event_tracking_group_id == tracking_group_obj.id)
    )
