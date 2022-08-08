from boxtribute_server.models.definitions.distribution_event import DistributionEvent
from boxtribute_server.models.definitions.packing_list_entry import PackingListEntry
from boxtribute_server.models.definitions.unboxed_items_collection import (
    UnboxedItemsCollection,
)

from ..db import db
from ..enums import DistributionEventState, LocationType, PackingListEntryState
from ..exceptions import (
    InvalidDistributionEventState,
    ModifyCompletedDistributionEvent,
    NotEnoughItemsInBox,
)
from ..models.definitions.box import Box
from ..models.definitions.location import Location
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

        if box.items < number_of_items:
            raise NotEnoughItemsInBox(
                box_label_identifier=box_label_identifier,
                number_of_requested_items=number_of_items,
                number_of_actual_items=box.items,
            )

        unboxed_items_collection, _ = UnboxedItemsCollection.get_or_create(
            distribution_event=distribution_event_id,
            product=box.product.id,
            size=box.size.id,
            defaults={"number_of_items": 0, "location": box.location.id},
        )

        unboxed_items_collection.number_of_items += number_of_items
        box.items -= number_of_items

        unboxed_items_collection.save()
        box.save()
        return unboxed_items_collection


def move_box_to_distribution_event(box_label_identifier, distribution_event_id):
    """Move a box to a distribution event."""
    with db.database.atomic():
        distribution_event = DistributionEvent.get_by_id(distribution_event_id)
        # Completed Events should not be mutable anymore
        if distribution_event.state == DistributionEventState.Completed:
            raise ModifyCompletedDistributionEvent(
                desired_operation="move_box_to_distribution_event",
                distribution_event_id=distribution_event.id,
            )
        box = Box.get(Box.label_identifier == box_label_identifier)
        box.location = distribution_event.distribution_spot_id
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
