"""Create-Retrieve-Update-Delete operations on database models."""
import hashlib
import random

import peewee

from ..db import db
from ..enums import BoxState, TaggableObjectType, TagType
from ..exceptions import (
    BoxCreationFailed,
    IncompatibleTagTypeAndResourceType,
    NegativeNumberOfItems,
)
from .definitions.beneficiary import Beneficiary
from .definitions.box import Box
from .definitions.history import DbChangeHistory
from .definitions.location import Location
from .definitions.product import Product
from .definitions.qr_code import QrCode
from .definitions.size import Size
from .definitions.tag import Tag
from .definitions.tags_relation import TagsRelation
from .definitions.x_beneficiary_language import XBeneficiaryLanguage
from .utils import save_creation_to_history, save_update_to_history, utcnow

BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS = 10


@save_creation_to_history
def create_box(
    product_id,
    location_id,
    user_id,
    size_id,
    comment="",
    number_of_items=None,
    qr_code=None,
    tag_ids=None,
):
    """Insert information for a new Box in the database. Use current datetime
    and box state "InStock" by default. If a location with a box state is passed
    use its box state for the new box. Generate an 8-digit sequence to identify the
    box. If the sequence is not unique, repeat the generation several times. If
    generation still fails, raise a BoxCreationFailed exception.
    Assign any given tags to the newly created box.
    """

    now = utcnow()
    qr_id = QrCode.get_id_from_code(qr_code) if qr_code is not None else None

    location_box_state_id = Location.get_by_id(location_id).box_state_id
    box_state = (
        BoxState.InStock if location_box_state_id is None else location_box_state_id
    )
    if number_of_items is not None and number_of_items < 0:
        raise NegativeNumberOfItems()

    for i in range(BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS):
        try:
            new_box = Box()
            new_box.comment = comment
            new_box.created_on = now
            new_box.created_by = user_id
            new_box.number_of_items = number_of_items
            new_box.label_identifier = "".join(random.choices("0123456789", k=8))
            new_box.last_modified_on = now
            new_box.last_modified_by = user_id
            new_box.location = location_id
            new_box.product = product_id
            new_box.size = size_id
            new_box.state = box_state
            new_box.qr_code = qr_id

            with db.database.atomic():
                new_box.save()
                for tag_id in tag_ids or []:
                    assign_tag(
                        user_id=user_id,
                        id=tag_id,
                        resource_id=new_box.id,
                        resource_type=TaggableObjectType.Box,
                    )
                return new_box

        except peewee.IntegrityError as e:
            # peewee throws the same exception for different constraint violations.
            # E.g. failing "NOT NULL" constraint shall be directly reported
            if "Duplicate entry" not in str(e):
                raise
    raise BoxCreationFailed()


@save_update_to_history(
    id_field_name="label_identifier",
    fields=[
        Box.label_identifier,
        Box.product,
        Box.size,
        Box.number_of_items,
        Box.location,
        Box.comment,
    ],
)
def update_box(
    label_identifier,
    user_id,
    comment=None,
    number_of_items=None,
    location_id=None,
    product_id=None,
    size_id=None,
    state=None,
    tag_ids=None,
):
    """Look up an existing Box given a UUID, and update all requested fields.
    Insert timestamp for modification and return the box.
    """
    box = Box.get(Box.label_identifier == label_identifier)

    if comment is not None:
        box.comment = comment
    if number_of_items is not None:
        if number_of_items < 0:
            raise NegativeNumberOfItems()
        box.number_of_items = number_of_items
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
    if state is not None:
        box.state = state
    if tag_ids is not None:
        # Find all tag IDs that are currently assigned to the box
        assigned_tag_ids = set(
            r.tag_id
            for r in TagsRelation.select(TagsRelation.tag_id).where(
                TagsRelation.object_type == TaggableObjectType.Box,
                TagsRelation.object_id == box.id,
            )
        )
        updated_tag_ids = set(tag_ids)

        # Unassign all tags that were previously assigned to the box but are not part
        # of the updated set of tags
        for tag_id in assigned_tag_ids.difference(updated_tag_ids):
            unassign_tag(
                user_id=user_id,
                id=tag_id,
                resource_id=box.id,
                resource_type=TaggableObjectType.Box,
            )
        # Assign all tags that are part of the updated set of tags but were previously
        # not assigned to the box
        for tag_id in updated_tag_ids.difference(assigned_tag_ids):
            assign_tag(
                user_id=user_id,
                id=tag_id,
                resource_id=box.id,
                resource_type=TaggableObjectType.Box,
            )

    box.last_modified_by = user_id
    box.last_modified_on = utcnow()
    box.save()
    return box


def create_tag(
    *,
    name,
    description="",
    color,
    type,
    user_id,
    base_id,
):
    """Insert information for a new Tag in the database."""
    now = utcnow()
    return Tag.create(
        color=color,
        created=now,
        created_by=user_id,
        description=description,
        name=name,
        modified=now,
        modified_by=user_id,
        type=type,
        base=base_id,
    )


def update_tag(
    *,
    id,
    name=None,
    description=None,
    color=None,
    type=None,
    user_id,
):
    """Look up an existing Tag given an ID, and update all requested fields.
    If the tag type is changed from All/Beneficiary to Box, remove the tag from all
    beneficiaries that had it assigned before (vice versa when changing tag type from
    All/Box to Beneficiary).
    Insert timestamp for modification and return the tag.
    """
    tag = Tag.get_by_id(id)

    if name is not None:
        tag.name = name
    if description is not None:
        tag.description = description
    if color is not None:
        tag.color = color

    object_type_for_deletion = None
    # Skip tags-relation modification if type does not change
    if type is not None and type != tag.type:
        if type == TagType.Box:
            object_type_for_deletion = TaggableObjectType.Beneficiary
        elif type == TagType.Beneficiary:
            object_type_for_deletion = TaggableObjectType.Box
        tag.type = type

    tag.modified = utcnow()
    tag.modified_by = user_id

    with db.database.atomic():
        tag.save()
        if object_type_for_deletion is not None:
            TagsRelation.delete().where(
                (TagsRelation.object_type == object_type_for_deletion)
                & (TagsRelation.tag == id)
            ).execute()
    return tag


def delete_tag(*, user_id, id):
    """Soft-delete given tag by setting the 'deleted' timestamp. Unassign the tag from
    any resources by deleting respective rows of the TagsRelation model.
    Return the soft-deleted tag.
    """
    now = utcnow()
    tag = Tag.get_by_id(id)
    tag.deleted = now
    tag.modified = now
    tag.modified_by = user_id
    with db.database.atomic():
        tag.save()
        TagsRelation.delete().where(TagsRelation.tag == id).execute()
    return tag


def assign_tag(*, user_id, id, resource_id, resource_type):
    """Create TagsRelation entry as cross reference of the tag given by ID, and the
    given resource (a box or a beneficiary). Insert timestamp for modification in
    resource model.
    Validate that tag type and resource type are compatible.
    Return the resource.
    """
    tag = Tag.get_by_id(id)
    if (
        (tag.type == TagType.Beneficiary) and (resource_type == TaggableObjectType.Box)
    ) or (
        (tag.type == TagType.Box) and (resource_type == TaggableObjectType.Beneficiary)
    ):
        raise IncompatibleTagTypeAndResourceType(tag=tag, resource_type=resource_type)

    model = Box if resource_type == TaggableObjectType.Box else Beneficiary
    resource = model.get_by_id(resource_id)
    resource.last_modified_by = user_id
    resource.last_modified_on = utcnow()

    with db.database.atomic():
        TagsRelation.create(
            object_id=resource_id,
            object_type=resource_type,
            tag=id,
        )
        resource.save()
    return resource


def unassign_tag(*, user_id, id, resource_id, resource_type):
    """Delete TagsRelation entry defined by given tag ID, resource ID, and resource
    type. Insert timestamp for modification in resource model.
    Return the resource that the tag was unassigned from.
    """
    model = Box if resource_type == TaggableObjectType.Box else Beneficiary
    resource = model.get_by_id(resource_id)
    resource.last_modified_by = user_id
    resource.last_modified_on = utcnow()

    with db.database.atomic():
        TagsRelation.delete().where(
            TagsRelation.tag == id,
            TagsRelation.object_id == resource_id,
            TagsRelation.object_type == resource_type,
        ).execute()
        resource.save()
    return resource


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


def get_box_history(box_id):
    entries = []
    for raw_entry in DbChangeHistory.select().where(
        DbChangeHistory.table_name == "stock",
        DbChangeHistory.record_id == box_id,
    ):
        changes = raw_entry.changes
        if changes == "items":
            changes = (
                f"changed the number of items from {raw_entry.from_int} to "
                + f"{raw_entry.to_int};"
            )

        elif changes == "product_id":
            old_product = Product.get_by_id(raw_entry.from_int)
            new_product = Product.get_by_id(raw_entry.to_int)
            changes = (
                f"changed product type from {old_product.name} to "
                + f"{new_product.name};"
            )

        elif changes == "location_id":
            old_location = Location.get_by_id(raw_entry.from_int)
            new_location = Location.get_by_id(raw_entry.to_int)
            changes = (
                f"changed box location from {old_location.name} to "
                + f"{new_location.name};"
            )

        elif changes == "size_id":
            old_size = Size.get_by_id(raw_entry.from_int)
            new_size = Size.get_by_id(raw_entry.to_int)
            changes = f"changed size from {old_size.label} to {new_size.label};"

        elif changes.startswith("comments"):
            changes = changes.replace("comments changed", "changed comments")

        elif changes.startswith("Record"):
            changes = changes.replace("Record created", "created record")

        raw_entry.changes = changes
        entries.append(raw_entry)
    return entries
