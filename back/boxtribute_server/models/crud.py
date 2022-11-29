"""Create-Retrieve-Update-Delete operations on database models."""
import hashlib

from ..db import db
from ..enums import BoxState, TaggableObjectType, TagType
from ..exceptions import IncompatibleTagTypeAndResourceType
from .definitions.beneficiary import Beneficiary
from .definitions.box import Box
from .definitions.history import DbChangeHistory
from .definitions.location import Location
from .definitions.product import Product
from .definitions.qr_code import QrCode
from .definitions.size import Size
from .definitions.tag import Tag
from .definitions.tags_relation import TagsRelation
from .utils import utcnow


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

        elif changes == "box_state_id":
            old_state = BoxState(raw_entry.from_int)
            new_state = BoxState(raw_entry.to_int)
            changes = f"changed box state from {old_state.name} to {new_state.name};"

        elif changes.startswith("comments"):
            changes = changes.replace("comments changed", "changed comments")

        elif changes.startswith("Record"):
            changes = changes.replace("Record created", "created record")

        raw_entry.changes = changes
        entries.append(raw_entry)
    return entries
