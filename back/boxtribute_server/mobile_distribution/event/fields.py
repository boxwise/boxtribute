from ariadne import ObjectType, convert_kwargs_to_snake_case

from ...authz import authorize
from ...models.definitions.box import Box
from ...models.definitions.distribution_event import DistributionEvent
from ...models.definitions.packing_list_entry import PackingListEntry
from ...models.definitions.unboxed_items_collection import UnboxedItemsCollection

distribution_event = ObjectType("DistributionEvent")


@distribution_event.field("boxes")
@convert_kwargs_to_snake_case
def resolve_distribution_event_boxes(distribution_event_obj, _):
    authorize(
        permission="stock:read",
        base_id=distribution_event_obj.distribution_spot.base_id,
    )
    return Box.select().where(Box.distribution_event == distribution_event_obj.id)


@distribution_event.field("unboxedItemsCollections")
@convert_kwargs_to_snake_case
def resolve_distribution_event_unboxed_item_collections(distribution_event_obj, _):
    authorize(permission="stock:read")
    return UnboxedItemsCollection.select().where(
        UnboxedItemsCollection.distribution_event == distribution_event_obj.id
    )


@distribution_event.field("packingListEntries")
def resolve_packing_list_entries(distro_event_obj, *_):
    event = DistributionEvent.get_by_id(distro_event_obj.id)
    authorize(
        permission="packing_list_entry:read", base_id=event.distribution_spot.base_id
    )
    return PackingListEntry.select().where(
        PackingListEntry.distribution_event == distro_event_obj.id
    )


@distribution_event.field("distributionEventsTrackingGroup")
def resolve_tracking_group_of_distribution_event(distro_event_obj, *_):
    authorize(
        permission="distro_event:read",
        base_id=distro_event_obj.distribution_spot.base_id,
    )
    return distro_event_obj.distribution_events_tracking_group
