from collections import Counter

from boxtribute_server.models.definitions.distribution_event_tracking_log_entry import (
    DistributionEventTrackingLogEntry,
)
from boxtribute_server.models.definitions.distribution_events_tracking_group import (
    DistributionEventsTrackingGroup,
)

from ..db import db
from ..enums import (
    DistributionEventState,
    DistributionEventsTrackingGroupState,
    DistributionEventTrackingFlowDirection,
    LocationType,
    PackingListEntryState,
)
from ..exceptions import (
    DistributionEventAlreadyInTrackingGroup,
    InvalidDistributionEventState,
    ModifyCompletedDistributionEvent,
    NotEnoughItemsInBox,
)
from ..models.definitions.box import Box
from ..models.definitions.distribution_event import DistributionEvent
from ..models.definitions.location import Location
from ..models.definitions.packing_list_entry import PackingListEntry
from ..models.definitions.product import Product
from ..models.definitions.size import Size
from ..models.definitions.size_range import SizeRange
from ..models.definitions.unboxed_items_collection import UnboxedItemsCollection
from ..models.utils import utcnow


def move_items_from_box_to_distribution_event(
    user_id, box_label_identifier, distribution_event_id, number_of_items
):
    """
    Move items from a box to a distribution event.
    """

    with db.database.atomic():
        # Completed Events should not be mutable anymore
        distribution_event = DistributionEvent.get_by_id(distribution_event_id)
        if distribution_event.state == DistributionEventState.Completed:
            raise ModifyCompletedDistributionEvent(
                desired_operation="add_items",
                distribution_event_id=distribution_event.id,
            )

        box = Box.get(Box.label_identifier == box_label_identifier)

        if box.number_of_items < number_of_items:
            raise NotEnoughItemsInBox(
                box_label_identifier=box_label_identifier,
                number_of_requested_items=number_of_items,
                number_of_actual_items=box.number_of_items,
            )

        unboxed_items_collection, _ = UnboxedItemsCollection.get_or_create(
            distribution_event=distribution_event_id,
            product=box.product.id,
            size=box.size.id,
            defaults={"number_of_items": 0, "location": box.location.id},
        )

        unboxed_items_collection.number_of_items += number_of_items
        box.number_of_items -= number_of_items

        unboxed_items_collection.save()
        box.save()
        return unboxed_items_collection


def unassign_box_from_distribution_event(box_label_identifier, distribution_event_id):
    """Assigns a box to a distribution event."""
    with db.database.atomic():

        # TODO: consider to to do validation checks here, once
        # business rules are finalised

        box = Box.get(Box.label_identifier == box_label_identifier)
        # TODO: business logic might actually be better to set the location to
        # the Distro Spot only once the whole event is moved into
        # state "OnDistribution"
        box.distribution_event = None
        box.save()
        return box


def assign_box_to_distribution_event(box_label_identifier, distribution_event_id):
    """Assigns a box to a distribution event."""
    with db.database.atomic():
        distribution_event = DistributionEvent.get_by_id(distribution_event_id)
        # Completed Events should not be mutable anymore
        if distribution_event.state == DistributionEventState.Completed:
            raise ModifyCompletedDistributionEvent(
                desired_operation="assign_box_to_distribution_event",
                distribution_event_id=distribution_event.id,
            )
        box = Box.get(Box.label_identifier == box_label_identifier)
        box.distribution_event = distribution_event_id
        box.save()
        return box


def change_distribution_event_state(distribution_event_id, distribution_event_state):
    distribution_event = DistributionEvent.get_by_id(distribution_event_id)

    # Completed Events should not be mutable anymore
    if distribution_event.state == DistributionEventState.Completed:
        raise InvalidDistributionEventState(
            expected_states=[
                s
                for s in DistributionEventState
                if s != DistributionEventState.Completed
            ],
            actual_state=distribution_event_state,
        )

    distribution_event.state = distribution_event_state
    distribution_event.save()
    return distribution_event


def set_products_for_packing_list(
    *, user_id, distribution_event_id, product_ids_to_add, product_ids_to_remove
):
    """
    TODO: Add description and consider to extract sub logic into a separate functions.
    """
    with db.database.atomic():
        # Completed Events should not be mutable anymore
        distribution_event = DistributionEvent.get_by_id(distribution_event_id)
        if distribution_event.state == DistributionEventState.Completed:
            raise ModifyCompletedDistributionEvent(
                desired_operation="set_products_for_packing_list",
                distribution_event_id=distribution_event.id,
            )

        # Remove products
        for product_id in product_ids_to_remove:
            remove_all_packing_list_entries_from_distribution_event_for_product(
                user_id=user_id,
                distribution_event_id=distribution_event_id,
                product_id=product_id,
            )

        # Add new products
        now = utcnow()
        for product_id in product_ids_to_add:
            sizes = (
                Size.select(Size.id)
                .join(SizeRange)
                .join(Product)
                .where(Product.id == product_id)
            )

            for size in sizes:

                PackingListEntry.get_or_create(
                    distribution_event=distribution_event_id,
                    product=product_id,
                    size=size.id,
                    defaults={
                        "number_of_items": 0,
                        "created_by": user_id,
                        "created_on": now,
                        "state": PackingListEntryState.NotStarted,
                    },
                )

        return distribution_event


def remove_all_packing_list_entries_from_distribution_event_for_product(
    *, user_id, distribution_event_id, product_id
):
    """
    Remove all packing list entries from a distribution event for a product.
    """
    with db.database.atomic():

        PackingListEntry.delete().where(
            PackingListEntry.distribution_event == distribution_event_id,
            PackingListEntry.product == product_id,
        ).execute()

        return True


def update_packing_list_entry(*, user_id, packing_list_entry_id, number_of_items):
    """
    Update a packing list entry.
    """
    now = utcnow()

    packing_list_entry = PackingListEntry.get_by_id(packing_list_entry_id)

    packing_list_entry.number_of_items = number_of_items
    packing_list_entry.last_modified_on = now
    packing_list_entry.last_modified_by = user_id
    packing_list_entry.save()
    return packing_list_entry


def add_packing_list_entry_to_distribution_event(
    user_id,
    distribution_event_id,
    product_id,
    size_id,
    number_of_items,
):
    """
    Add a packing list entry to a distribution event.
    """
    now = utcnow()

    # Completed Events should not be mutable anymore
    distribution_event = DistributionEvent.get_by_id(distribution_event_id)
    if distribution_event.state == DistributionEventState.Completed:
        raise ModifyCompletedDistributionEvent(
            desired_operation="add_packing_list_entry",
            distribution_event_id=distribution_event_id,
        )

    existing_packing_list_entry = PackingListEntry.get_or_none(
        PackingListEntry.distribution_event == distribution_event_id,
        PackingListEntry.product == product_id,
        PackingListEntry.size == size_id,
    )
    if existing_packing_list_entry is not None:
        if number_of_items > 0:
            existing_packing_list_entry.number_of_items = number_of_items
            existing_packing_list_entry.save()
            return existing_packing_list_entry
        else:
            PackingListEntry.delete().where(
                PackingListEntry.id == existing_packing_list_entry
            ).execute()
            return

    else:
        return PackingListEntry.create(
            distribution_event=distribution_event_id,
            product=product_id,
            number_of_items=number_of_items,
            size=size_id,
            state=PackingListEntryState.NotStarted,
            created_on=now,
            created_by=user_id,
            last_modified_on=now,
            last_modified_by=user_id,
        )


def create_distribution_event(
    user_id,
    distribution_spot_id,
    name,
    planned_start_date_time,
    planned_end_date_time=None,
):
    """
    TODO: Add description here
    """

    if planned_end_date_time is None:
        # TODO: consider to change endDateTime to startDateTime + 2 or 3 hours
        planned_end_date_time = planned_start_date_time

    """
    TODO: ensure that distribution_spot_id is realy from a Distribution Spot
    and not from a Location
    """

    now = utcnow()

    with db.database.atomic():
        new_distribution_event = DistributionEvent.create(
            name=name,
            planned_start_date_time=planned_start_date_time,
            planned_end_date_time=planned_end_date_time,
            distribution_spot_id=distribution_spot_id,
            created_on=now,
            created_by=user_id,
            last_modified_on=now,
            last_modified_by=1,
        )

        return new_distribution_event


def delete_packing_list_entry(packing_list_entry_id):

    with db.database.atomic():
        packing_list_entry = PackingListEntry.get_by_id(packing_list_entry_id)
        # Completed Events should not be mutable anymore
        if (
            packing_list_entry.distribution_event.state
            == DistributionEventState.Completed
        ):
            raise ModifyCompletedDistributionEvent(
                desired_operation="remove_items",
                distribution_event_id=packing_list_entry.distribution_event.id,
            )
        PackingListEntry.delete().where(
            PackingListEntry.id == packing_list_entry
        ).execute()


def create_distribution_spot(
    user_id, base_id, name, comment=None, latitude=None, longitude=None
):
    """Insert information for a new DistributionSpot in the database."""
    now = utcnow()
    new_distribution_spot = Location.create(
        created_on=now,
        created_by=user_id,
        last_modified_on=now,
        last_modified_by=user_id,
        type=LocationType.DistributionSpot,
        base_id=base_id,
        name=name,
        comment=comment,
        latitude=latitude,
        longitude=longitude,
    )
    return new_distribution_spot


def start_distribution_events_tracking_group(
    user_id,
    distribution_event_ids,
    base_id,
    # returned_to_location_id
):
    """TODO: DESCRIPTION"""
    # TODO: Consider to consistency checks
    # (here and for other mobile distro spot/event etc relations)
    # that the base of the tracking group is the same as the one of the distro spot
    # and (if they will have camp-ids as well) distro events

    with db.database.atomic():
        distribution_events = DistributionEvent.select().where(
            DistributionEvent.id << distribution_event_ids
        )

        # check that all events are
        # * in the correct state
        # * are not yet part of another tracking group
        for distribution_event in distribution_events:
            if (
                distribution_event.state
                != DistributionEventState.ReturnedFromDistribution
            ):
                raise InvalidDistributionEventState(
                    expected_states=[DistributionEventState.ReturnedFromDistribution],
                    actual_state=distribution_event.state,
                )
            if distribution_event.distribution_events_tracking_group is not None:
                raise DistributionEventAlreadyInTrackingGroup()

        now = utcnow()
        new_distribution_events_tracking_group = DistributionEventsTrackingGroup.create(
            created_on=now,
            created_by=user_id,
            last_modified_on=now,
            last_modified_by=user_id,
            state=DistributionEventsTrackingGroupState.InProgress,
            base=base_id,
        )
        for distribution_event in distribution_events:
            distribution_event.distribution_events_tracking_group = (
                new_distribution_events_tracking_group.id
            )
            distribution_event.state = DistributionEventState.ReturnTrackingInProgress
            distribution_event.save()

        # sum up all numbers of items across:
        # * all distribution events
        # * all products
        # * all sizes
        # * for all UnboxedItemCollections AND Boxes
        product_size_tuples_to_number_of_items_counter = Counter()

        boxes = Box.select().where(DistributionEvent.id << distribution_event_ids)
        unboxed_items_collections = UnboxedItemsCollection.select().where(
            DistributionEvent.id << distribution_event_ids
        )

        # TODO: make this more DRY
        # (currently logic repeats for boxes and unboxed items collections)
        for box in boxes:
            # TODO: general discussion point: might it make sense
            # to introduce Size/Product tuples as a full data type,
            # with its own table and id?
            product_size_tuple = (box.product_id, box.size_id)
            product_size_tuples_to_number_of_items_counter[
                product_size_tuple
            ] += box.number_of_items
            box.number_of_items = 0

            # TODO: consider to change this and use
            # returned_to_location_id as the location_id
            # for all returned boxes
            # box.location_id = returned_to_location_id

            # TODO: set all UnboxedItemsCollection to correct state (?)
            box.save()

        for unboxed_items_collection in unboxed_items_collections:
            product_size_tuple = (
                unboxed_items_collection.product_id,
                unboxed_items_collection.size_id,
            )
            product_size_tuples_to_number_of_items_counter[
                product_size_tuple
            ] += unboxed_items_collection.number_of_items
            unboxed_items_collection.number_of_items = 0
            # TODO: set all Boxes to correct state
            # TODO: consider to just delete the unboxed_items_collection?
            unboxed_items_collection.save()

        # create log entries for all calculated numbers
        for key, value in product_size_tuples_to_number_of_items_counter.items():
            product_id, size_id = key

            if value > 0:
                DistributionEventTrackingLogEntry.create(
                    distro_event_tracking_group=new_distribution_events_tracking_group,
                    flow_direction=DistributionEventTrackingFlowDirection.Out,
                    date=now,
                    product_id=product_id,
                    size_id=size_id,
                    number_of_items=value,
                )

        return new_distribution_events_tracking_group


def track_return_of_items_for_distribution_events_tracking_group(
    distribution_events_tracking_group_id, product_id, size_id, number_of_items
):
    now = utcnow()
    with db.database.atomic():
        # TODO: validation/checks
        # * ensure that for the tracking_group, product_id, size_id combo:
        #   * the sum of numberOfItems for the OUT log entries for that combo
        #   * MINUS the sum of numberOfItems for the IN log entries for that combo
        #   * is >= the number_of_items parameter
        return DistributionEventTrackingLogEntry.create(
            distro_event_tracking_group=distribution_events_tracking_group_id,
            flow_direction=DistributionEventTrackingFlowDirection.In,
            date=now,
            product_id=product_id,
            size_id=size_id,
            number_of_items=number_of_items,
        )


def move_items_from_return_tracking_group_to_box(
    distribution_events_tracking_group_id,
    product_id,
    size_id,
    number_of_items,
    target_box_label_identifier,
):
    now = utcnow()
    # TODO: validation/checks
    # * ensure that for the tracking_group, product_id, size_id combo:
    #   (
    #     sum(logEntries(direction=In, trackingGroup, productId, sizeId).numberOfItems)
    #     -
    #     sum(
    #       logEntries(direction=BackToBox, trackingGroup, productId, sizeId)
    #       .numberOfItems
    #     )
    #   )
    #   >= number_of_items mutation parameter

    # * ensure that the product/size combo is matching with the target box product/size
    with db.database.atomic():
        log_entry = DistributionEventTrackingLogEntry.create(
            distro_event_tracking_group=distribution_events_tracking_group_id,
            flow_direction=DistributionEventTrackingFlowDirection.BackToBox,
            date=now,
            product_id=product_id,
            size_id=size_id,
            number_of_items=number_of_items,
        )
        target_box = Box.get(Box.label_identifier == target_box_label_identifier)
        target_box.number_of_items += number_of_items
        target_box.save()
        return log_entry


def complete_distribution_events_tracking_group(distribution_events_tracking_group_id):
    with db.database.atomic():
        distro_events_tracking_group = DistributionEventsTrackingGroup.get_by_id(
            distribution_events_tracking_group_id
        )
        distribution_events = distro_events_tracking_group.distribution_events
        for distribution_event in distribution_events:
            distribution_event.state = DistributionEventState.Completed
            distribution_event.save()
        distro_events_tracking_group.state = (
            DistributionEventsTrackingGroupState.Completed
        )
        distro_events_tracking_group.save()
        return distro_events_tracking_group
