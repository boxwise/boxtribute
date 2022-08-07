"""Create-Retrieve-Update-Delete operations on database models."""
import hashlib
import random

import peewee
from boxtribute_server.models.definitions.distribution_event import DistributionEvent
from boxtribute_server.models.definitions.packing_list_entry import PackingListEntry
from boxtribute_server.models.definitions.unboxed_items_collection import (
    UnboxedItemsCollection,
)

from ..db import db
from ..enums import (
    BoxState,
    DistributionEventState,
    LocationType,
    PackingListEntryState,
)
from ..exceptions import (
    BoxCreationFailed,
    InvalidDistributionEventState,
    ModifyCompletedDistributionEvent,
    NotEnoughItemsInBox,
)
from .definitions.beneficiary import Beneficiary
from .definitions.box import Box
from .definitions.location import Location
from .definitions.qr_code import QrCode
from .definitions.x_beneficiary_language import XBeneficiaryLanguage
from .utils import utcnow

BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS = 10


def create_box(
    product_id,
    location_id,
    user_id,
    size_id,
    comment="",
    items=None,
    qr_code=None,
):
    """Insert information for a new Box in the database. Use current datetime
    and box state "InStock" by default. If a location with a box state is passed
    use its box state for the new box. Generate an 8-digit sequence to identify the
    box. If the sequence is not unique, repeat the generation several times. If
    generation still fails, raise a BoxCreationFailed exception.
    """

    now = utcnow()
    qr_id = QrCode.get_id_from_code(qr_code) if qr_code is not None else None

    location_box_state_id = Location.get_by_id(location_id).box_state_id
    box_state = (
        BoxState.InStock if location_box_state_id is None else location_box_state_id
    )
    for i in range(BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS):
        try:
            new_box = Box.create(
                comment=comment,
                created_on=now,
                created_by=user_id,
                items=items,
                label_identifier="".join(random.choices("0123456789", k=8)),
                last_modified_on=now,
                last_modified_by=user_id,
                location=location_id,
                product=product_id,
                size=size_id,
                state=box_state,
                qr_code=qr_id,
            )
            return new_box
        except peewee.IntegrityError as e:
            # peewee throws the same exception for different constraint violations.
            # E.g. failing "NOT NULL" constraint shall be directly reported
            if "Duplicate entry" not in str(e):
                raise
    raise BoxCreationFailed()


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
        box = Box.get(Box.label_identifier == box_label_identifier)
        distribution_event = DistributionEvent.get_by_id(distribution_event_id)
        # Completed Events should not be mutable anymore
        distribution_event = DistributionEvent.get_by_id(distribution_event_id)
        if distribution_event.state == DistributionEventState.Completed:
            raise ModifyCompletedDistributionEvent(
                desired_operation="move_box_to_distribution_event",
                distribution_event_id=distribution_event.id,
            )
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


def update_box(
    label_identifier,
    user_id,
    comment=None,
    items=None,
    location_id=None,
    product_id=None,
    size_id=None,
):
    """Look up an existing Box given a UUID, and update all requested fields.
    Insert timestamp for modification and return the box.
    """
    box = Box.get(Box.label_identifier == label_identifier)

    if comment is not None:
        box.comment = comment
    if items is not None:
        box.items = items
    if location_id is not None:
        box.location = location_id
        location_box_state_id = Location.get_by_id(location_id).box_state_id
        box.state = (
            location_box_state_id if location_box_state_id is not None else box.state_id
        )
    if product_id is not None:
        box.product = product_id
    if size_id is not None:
        box.size = size_id

    box.last_modified_by = user_id
    box.last_modified_on = utcnow()
    box.save()
    return box


def create_beneficiary(
    *,
    user,
    first_name,
    last_name,
    base_id,
    group_identifier,
    date_of_birth,
    gender,
    is_volunteer,
    registered,
    comment="",
    languages=None,
    family_head_id=None,
    signature=None,
    date_of_signature=None,
):
    """Insert information for a new Beneficiary in the database. Update the
    languages in the corresponding cross-reference table.
    """
    now = utcnow()
    data = dict(
        first_name=first_name,
        last_name=last_name,
        base=base_id,
        group_identifier=group_identifier,
        date_of_birth=date_of_birth,
        gender=gender.value,  # convert to gender abbreviation
        is_volunteer=is_volunteer,
        not_registered=not registered,
        signed=signature is not None,  # set depending on signature
        comment=comment,
        family_head=family_head_id,
        created_on=now,
        created_by=user.id,
        last_modified_on=now,
        last_modified_by=user.id,
        # This is only required for compatibility with legacy DB
        seq=1 if family_head_id is None else 2,
        # These fields are required acc. to model definition
        family_id=0,
        bicycle_ban_comment="",
        workshop_ban_comment="",
    )
    if date_of_signature is not None:
        # Work-around because the DB default 0000-00-00 is not a Python date
        data["date_of_signature"] = date_of_signature
    new_beneficiary = Beneficiary.create(**data)

    language_ids = languages or []
    XBeneficiaryLanguage.insert_many(
        [{"language": lid, "beneficiary": new_beneficiary.id} for lid in language_ids]
    ).execute()

    return new_beneficiary


def update_beneficiary(
    *,
    user,
    id,
    base_id=None,
    gender=None,
    languages=None,
    family_head_id=None,
    registered=None,
    signature=None,
    **data,
):
    """Look up an existing Beneficiary given an ID, and update all requested fields,
    including the language cross-reference.
    Insert timestamp for modification and return the beneficiary.
    """
    beneficiary = Beneficiary.get_by_id(id)

    # Handle any items with keys not matching the Model fields
    if base_id is not None:
        beneficiary.base = base_id

    if gender is not None:
        beneficiary.gender = gender.value

    if family_head_id is not None:
        beneficiary.family_head = family_head_id
    beneficiary.seq = 1 if family_head_id is None else 2

    if registered is not None:
        beneficiary.not_registered = not registered

    if signature is not None:
        beneficiary.signed = True
        beneficiary.signature = signature

    # Set first_name, last_name, group_identifier, date_of_birth, comment, is_volunteer,
    # date_of_signature if specified via GraphQL input
    for field, value in data.items():
        setattr(beneficiary, field, value)

    beneficiary.last_modified_on = utcnow()
    beneficiary.last_modified_by = user.id

    with db.database.atomic():
        language_ids = languages or []
        if language_ids:
            XBeneficiaryLanguage.delete().where(
                XBeneficiaryLanguage.beneficiary == id
            ).execute()
            XBeneficiaryLanguage.insert_many(
                [{"language": lid, "beneficiary": id} for lid in language_ids]
            ).execute()
        beneficiary.save()

    return beneficiary


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


def create_qr_code(box_label_identifier=None):
    """Insert a new QR code in the database. Generate an MD5 hash based on its primary
    key. If a `box_label_identifier` is passed, look up the corresponding box (it is
    expected to exist) and associate the QR code with it.
    Return the newly created QR code.

    All operations are run inside an atomic transaction. If e.g. the box look-up fails,
    the operations are rolled back (i.e. no new QR code is inserted).
    """
    with db.database.atomic():
        new_qr_code = QrCode.create(created_on=utcnow())
        new_qr_code.code = hashlib.md5(str(new_qr_code.id).encode()).hexdigest()
        new_qr_code.save()

        if box_label_identifier is not None:
            box = Box.get(Box.label_identifier == box_label_identifier)
            box.qr_code = new_qr_code.id
            box.save()

    return new_qr_code
