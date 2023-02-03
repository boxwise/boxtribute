from ariadne import MutationType, convert_kwargs_to_snake_case
from flask import g

from ...authz import authorize
from ...models.definitions.box import Box
from ...models.definitions.distribution_event import DistributionEvent
from ...models.definitions.distribution_events_tracking_group import (
    DistributionEventsTrackingGroup,
)
from ...models.definitions.location import Location
from ...models.definitions.packing_list_entry import PackingListEntry
from ...models.definitions.product import Product
from ...models.definitions.unboxed_items_collection import UnboxedItemsCollection
from .crud import (
    add_packing_list_entry_to_distribution_event,
    assign_box_to_distribution_event,
    change_distribution_event_state,
    complete_distribution_events_tracking_group,
    delete_packing_list_entry,
    move_items_from_box_to_distribution_event,
    move_items_from_return_tracking_group_to_box,
    remove_all_packing_list_entries_from_distribution_event_for_product,
    set_products_for_packing_list,
    start_distribution_events_tracking_group,
    track_return_of_items_for_distribution_events_tracking_group,
    unassign_box_from_distribution_event,
)

mutation = MutationType()


@mutation.field("addPackingListEntryToDistributionEvent")
@convert_kwargs_to_snake_case
def resolve_add_packing_list_entry_to_distribution_event(*_, creation_input):
    event = DistributionEvent.get_by_id(creation_input["distribution_event_id"])
    authorize(
        permission="packing_list_entry:write", base_id=event.distribution_spot.base_id
    )
    return add_packing_list_entry_to_distribution_event(
        user_id=g.user.id, **creation_input
    )


@mutation.field("removeAllPackingListEntriesFromDistributionEventForProduct")
@convert_kwargs_to_snake_case
def resolve_remove_all_packing_list_entries_from_distribution_event_for_product(
    *_, distribution_event_id, product_id
):
    product = Product.get_by_id(product_id)
    authorize(permission="packing_list_entry:write", base_id=product.base_id)
    return remove_all_packing_list_entries_from_distribution_event_for_product(
        user_id=g.user.id,
        distribution_event_id=distribution_event_id,
        product_id=product_id,
    )


@mutation.field("updateSelectedProductsForDistributionEventPackingList")
@convert_kwargs_to_snake_case
def resolve_set_products_for_packing_list(
    *_, distribution_event_id, product_ids_to_add, product_ids_to_remove
):
    event = DistributionEvent.get_by_id(distribution_event_id)
    authorize(
        permission="packing_list_entry:write", base_id=event.distribution_spot.base_id
    )
    return set_products_for_packing_list(
        user_id=g.user.id,
        distribution_event_id=distribution_event_id,
        product_ids_to_add=product_ids_to_add,
        product_ids_to_remove=product_ids_to_remove,
    )


@mutation.field("startDistributionEventsTrackingGroup")
@convert_kwargs_to_snake_case
def resolve_start_distribution_events_tracking_group(
    *_,
    distribution_event_ids,
    base_id,
    # returned_to_location_id
):
    authorize(permission="distro_event:write", base_id=base_id)
    # TODO: do validation check that there is at least one
    # distribution event in the list
    return start_distribution_events_tracking_group(
        user_id=g.user.id,
        distribution_event_ids=distribution_event_ids,
        base_id=base_id,
        # returned_to_location_id=returned_to_location_id,
    )


@mutation.field("setReturnedNumberOfItemsForDistributionEventsTrackingGroup")
@convert_kwargs_to_snake_case
def resolve_track_return_of_items_for_distribution_events_tracking_group(
    *_, distribution_events_tracking_group_id, product_id, size_id, number_of_items
):
    tracking_group = DistributionEventsTrackingGroup.get_by_id(
        distribution_events_tracking_group_id
    )
    authorize(permission="distro_event:write", base_id=tracking_group.base_id)
    return track_return_of_items_for_distribution_events_tracking_group(
        # user_id=g.user.id,
        distribution_events_tracking_group_id=distribution_events_tracking_group_id,
        product_id=product_id,
        size_id=size_id,
        number_of_items=number_of_items,
    )


@mutation.field("moveItemsFromReturnTrackingGroupToBox")
@convert_kwargs_to_snake_case
def resolve_move_items_from_return_tracking_group_to_box(
    *_,
    distribution_events_tracking_group_id,
    product_id,
    size_id,
    number_of_items,
    target_box_label_identifier,
):
    tracking_group = DistributionEventsTrackingGroup.get_by_id(
        distribution_events_tracking_group_id
    )
    authorize(permission="distro_event:write", base_id=tracking_group.base_id)
    return move_items_from_return_tracking_group_to_box(
        # user_id=g.user.id,
        distribution_events_tracking_group_id=distribution_events_tracking_group_id,
        product_id=product_id,
        size_id=size_id,
        number_of_items=number_of_items,
        target_box_label_identifier=target_box_label_identifier,
    )


@mutation.field("removeItemsFromUnboxedItemsCollection")
@convert_kwargs_to_snake_case
def resolve_remove_items_from_unboxed_items_collection(*_, id, number_of_items):
    unboxed_items_collection = UnboxedItemsCollection.get_by_id(id)
    authorize(
        permission="distro_event:write",
        base_id=unboxed_items_collection.distribution_event.distribution_spot.base_id,
    )
    if unboxed_items_collection.number_of_items < number_of_items:
        raise Exception("Cannot remove more items than are in the collection")
    unboxed_items_collection.number_of_items -= number_of_items
    unboxed_items_collection.save()
    return unboxed_items_collection


@mutation.field("completeDistributionEventsTrackingGroup")
@convert_kwargs_to_snake_case
def resolve_complete_distribution_events_tracking_group(
    *_,
    id,
):
    tracking_group = DistributionEventsTrackingGroup.get_by_id(id)
    authorize(permission="distro_event:write", base_id=tracking_group.base_id)
    return complete_distribution_events_tracking_group(
        # user_id=g.user.id,
        id=id,
    )


@mutation.field("changeDistributionEventState")
@convert_kwargs_to_snake_case
def resolve_change_distribution_event_state(*_, distribution_event_id, new_state):
    event = (
        DistributionEvent.select()
        .join(Location)
        .where(DistributionEvent.id == distribution_event_id)
        .get()
    )
    authorize(permission="distro_event:write", base_id=event.distribution_spot.base_id)
    return change_distribution_event_state(distribution_event_id, new_state)


@mutation.field("assignBoxToDistributionEvent")
@convert_kwargs_to_snake_case
def resolve_assign_box_to_distribution_event(
    mutation_obj, _, box_label_identifier, distribution_event_id
):
    # Contemplate whether to enforce base-specific permission for box or event or both
    # Also: validate that base IDs of box location and event spot are identical
    event = DistributionEvent.get_by_id(distribution_event_id)
    authorize(permission="stock:write", base_id=event.distribution_spot.base_id)
    return assign_box_to_distribution_event(box_label_identifier, distribution_event_id)


@mutation.field("unassignBoxFromDistributionEvent")
@convert_kwargs_to_snake_case
def resolve_unassign_box_from_distribution_event(
    mutation_obj, _, box_label_identifier, distribution_event_id
):
    authorize(permission="stock:write")
    return unassign_box_from_distribution_event(
        box_label_identifier, distribution_event_id
    )


@mutation.field("moveItemsFromBoxToDistributionEvent")
@convert_kwargs_to_snake_case
def resolve_move_items_from_box_to_distribution_event(
    mutation_obj, _, box_label_identifier, distribution_event_id, number_of_items
):
    event = DistributionEvent.get_by_id(distribution_event_id)
    authorize(
        permission="unboxed_items_collection:write",
        base_id=event.distribution_spot.base_id,
    )
    box = Box.get(Box.label_identifier == box_label_identifier)
    authorize(permission="stock:write", base_id=box.location.base_id)
    return move_items_from_box_to_distribution_event(
        user_id=g.user.id,
        box_label_identifier=box_label_identifier,
        distribution_event_id=distribution_event_id,
        number_of_items=number_of_items,
    )


@mutation.field("removePackingListEntryFromDistributionEvent")
@convert_kwargs_to_snake_case
def resolve_remove_packing_list_entry_from_distribution_event(
    *_, packing_list_entry_id
):
    packing_list_entry = PackingListEntry.get(packing_list_entry_id)
    distribution_event = (
        DistributionEvent.select()
        .join(Location)
        .where(DistributionEvent.id == packing_list_entry.distribution_event)
        .get()
    )
    authorize(
        permission="distro_event:write",
        base_id=distribution_event.distribution_spot.base.id,
    )
    delete_packing_list_entry(packing_list_entry_id)
    return distribution_event
