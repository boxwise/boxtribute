from ariadne import ObjectType

from ....authz import authorize
from ....models.definitions.box import Box
from ....models.definitions.distribution_event import DistributionEvent
from ....models.definitions.packing_list_entry import PackingListEntry
from ....models.definitions.unboxed_items_collection import UnboxedItemsCollection

distribution_event = ObjectType("DistributionEvent")


@distribution_event.field("boxes")
def resolve_distribution_event_boxes(event_obj, _):
    authorize(
        permission="stock:read",
        base_id=event_obj.distribution_spot.base_id,
    )
    return Box.select().where(Box.distribution_event == event_obj.id)


@distribution_event.field("unboxedItemsCollections")
def resolve_distribution_event_unboxed_item_collections(event_obj, _):
    authorize(
        permission="stock:read",
        base_id=event_obj.distribution_spot.base_id,
    )
    return UnboxedItemsCollection.select().where(
        UnboxedItemsCollection.distribution_event == event_obj.id
    )


@distribution_event.field("packingListEntries")
def resolve_distribution_event_packing_list_entries(event_obj, *_):
    event = DistributionEvent.get_by_id(event_obj.id)
    authorize(
        permission="packing_list_entry:read", base_id=event.distribution_spot.base_id
    )
    return PackingListEntry.select().where(
        PackingListEntry.distribution_event == event_obj.id
    )


@distribution_event.field("distributionEventsTrackingGroup")
def resolve_distribution_event_tracking_group(event_obj, *_):
    authorize(
        permission="distro_event:read",
        base_id=event_obj.distribution_spot.base_id,
    )
    return event_obj.distribution_events_tracking_group
