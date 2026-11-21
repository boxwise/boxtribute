"""Validation of beneficiary input for the create/update mutations. The functions
return user errors (or None if the input is valid) instead of raising exceptions.
"""

import re
from datetime import datetime, time, timezone

from ...authz import authorize, handle_unauthorized
from ...enums import TagType
from ...errors import (
    BeneficiaryAlreadySigned,
    DeactivatedFamilyHead,
    DeletedService,
    DeletedTag,
    EmptyName,
    FamilyHeadBaseMismatch,
    FamilyHeadHasMembers,
    FamilyHeadIsMember,
    FamilyHeadSelfReference,
    InvalidDate,
    InvalidEmail,
    InvalidInitialCredit,
    ResourceDoesNotExist,
    ServiceBaseMismatch,
    TagBaseMismatch,
    TagTypeMismatch,
)
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.service import Service
from ...models.definitions.tag import Tag

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

TEXT_FIELDS = (
    "first_name",
    "last_name",
    "group_identifier",
    "email",
    "phone_number",
    "custom_text_field_1",
    "custom_text_field_2",
)


def strip_text_fields(data):
    """Return copy of the given input data with leading/trailing whitespace removed
    from the text fields. Unspecified fields and None values are retained.
    """
    return {
        key: value.strip() if key in TEXT_FIELDS and isinstance(value, str) else value
        for key, value in data.items()
    }


def fetch_family_head_and_tags(family_head_id, tag_ids):
    """Look up the family head and the tags with given IDs. Return a tuple consisting
    of the family head (None if no ID is given), the list of tags and a
    ResourceDoesNotExist error if any of the resources was not found (otherwise None).
    """
    family_head = None
    if family_head_id is not None:
        family_head = Beneficiary.get_or_none(Beneficiary.id == family_head_id)
        if family_head is None:
            error = ResourceDoesNotExist(name="Beneficiary", id=family_head_id)
            return None, [], error

    tags = []
    for tag_id in dict.fromkeys(tag_ids or []):  # remove duplicates, retain order
        tag = Tag.get_or_none(Tag.id == tag_id)
        if tag is None:
            return None, [], ResourceDoesNotExist(name="Tag", id=tag_id)
        tags.append(tag)
    return family_head, tags, None


def validate_family_head(family_head, *, base_id, beneficiary=None):
    """Return error if the given family head is not valid for the beneficiary in the
    given base. For beneficiaries that are updated, pass the `beneficiary`.
    """
    if beneficiary is not None and family_head.id == beneficiary.id:
        return FamilyHeadSelfReference()
    if family_head.base_id != base_id:
        return FamilyHeadBaseMismatch()
    if family_head.deleted_on is not None:
        return DeactivatedFamilyHead(id=family_head.id)
    if family_head.family_head_id is not None:
        return FamilyHeadIsMember(id=family_head.id)

    if (
        beneficiary is not None
        and beneficiary.family_head_id is None
        and Beneficiary.select()
        .where(Beneficiary.family_head == beneficiary.id)
        .exists()
    ):
        # Turning a family head into a family member would result in family members of
        # family members
        return FamilyHeadHasMembers()


def validate_tags(tags, *, base_id):
    """Return error for the first of the given tags that is not valid for assigning to
    a beneficiary in the given base.
    """
    for tag in tags:
        if tag.base_id != base_id:
            return TagBaseMismatch()
    for tag in tags:
        if tag.type not in (TagType.Beneficiary, TagType.All):
            return TagTypeMismatch(expected_type=TagType.Beneficiary)
    for tag in tags:
        if tag.deleted_on is not None:
            return DeletedTag(name=tag.name)


def validate_beneficiary_input(
    data,
    *,
    base_id,
    family_head=None,
    tags=(),
    beneficiary=None,
    initial_credit=None,
    signature=None,
):
    """Validate the (whitespace-stripped) creation/update input data, the family head
    and the tags that the beneficiary should be assigned to. For beneficiaries that
    are updated, pass the `beneficiary`.
    Return the first error that was found, or None.
    """
    for field in ("first_name", "last_name"):
        # Fields that are not specified (or None in the update input) are ignored
        if isinstance(data.get(field), str) and data[field] == "":
            return EmptyName()

    if signature is not None and beneficiary is not None and beneficiary.signed:
        return BeneficiaryAlreadySigned()

    if (date_of_birth := data.get("date_of_birth")) is not None:
        if date_of_birth > datetime.now(tz=timezone.utc).date():
            return InvalidDate(
                date=datetime.combine(date_of_birth, time.min, tzinfo=timezone.utc)
            )

    if (error := validate_tags(tags, base_id=base_id)) is not None:
        return error

    # Passing the current family head is valid (the family head is kept)
    if family_head is not None and (
        beneficiary is None or family_head.id != beneficiary.family_head_id
    ):
        error = validate_family_head(
            family_head, base_id=base_id, beneficiary=beneficiary
        )
        if error is not None:
            return error

    if initial_credit is not None and initial_credit < 0:
        return InvalidInitialCredit(initial_credit=initial_credit)

    email = data.get("email")
    if email and not EMAIL_PATTERN.match(email):
        return InvalidEmail(email=email)


@handle_unauthorized
def authorize_service(service):
    authorize(permission="service:read", base_id=service.base_id)


def validate_services(service_ids):
    """Validate services for given IDs. Return tuple consisting of:
    - list of IDs of valid services
    - list of info about erroneous services (non-existing, unauthorized for, or
      deleted)
    - ID of common base of all valid services, if there's a single base, otherwise None
    """
    service_errors = []
    valid_services = []
    for service_id in service_ids:
        if (service := Service.get_or_none(Service.id == service_id)) is None:
            service_errors.append(
                {
                    "id": service_id,
                    "error": ResourceDoesNotExist(name="Service", id=service_id),
                }
            )
        elif (error := authorize_service(service)) is not None:
            service_errors.append({"id": service_id, "error": error})
        elif service.deleted_on is not None:
            service_errors.append(
                {"id": service_id, "error": DeletedService(name=service.name)}
            )
        else:
            valid_services.append(service)

    base_ids = {service.base_id for service in valid_services}
    if len(base_ids) > 1:
        # None of the services is valid; return errors for all of them
        return (
            [],
            service_errors
            + [
                {"id": service.id, "error": ServiceBaseMismatch()}
                for service in valid_services
            ],
            None,
        )
    base_id = base_ids.pop() if base_ids else None
    return [service.id for service in valid_services], service_errors, base_id
