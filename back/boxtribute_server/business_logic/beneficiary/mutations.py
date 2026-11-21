from ariadne import MutationType
from flask import g

from ...authz import authorize, authorized_bases_filter, handle_unauthorized
from ...enums import TaggableObjectType, TagType
from ...errors import (
    BeneficiaryBaseMismatch,
    ResourceDoesNotExist,
    SingleBeneficiaryForMerge,
)
from ...models.definitions.base import Base
from ...models.definitions.beneficiary import Beneficiary
from ...models.utils import utcnow
from ..tag.crud import unassign_tags_from_resources
from ..tag.validation import validate_tags
from .crud import (
    IS_ACTIVE,
    IS_DEACTIVATED,
    BeneficiariesResult,
    BeneficiariesServicesOperationResult,
    BeneficiariesTagsOperationResult,
    assign_tags_to_beneficiaries,
    assigned_tag_ids,
    create_beneficiaries,
    create_beneficiary,
    deactivate_beneficiaries,
    detach_beneficiaries_from_family,
    find_beneficiaries,
    merge_beneficiaries_into_family,
    missing_tag_ids,
    reactivate_beneficiaries,
    register_services_for_beneficiaries,
    update_beneficiary,
)
from .validation import (
    fetch_family_head_and_tags,
    strip_text_fields,
    validate_beneficiary_input,
    validate_services,
)

mutation = MutationType()


@mutation.field("createBeneficiary")
@handle_unauthorized
def resolve_create_beneficiary(*_, creation_input):
    base_id = creation_input["base_id"]

    # Check existence
    family_head, tags, error = fetch_family_head_and_tags(
        creation_input.get("family_head_id"), creation_input.get("tag_ids")
    )
    if error is not None:
        return error

    # Authorize
    authorize(permission="beneficiary:create", base_id=base_id)
    authorize(permission="tag:read", base_id=base_id)
    authorize(permission="tags_relation:write")
    if Base.get_or_none(Base.id == base_id) is None:
        return ResourceDoesNotExist(name="Base", id=base_id)

    # Validate
    data = strip_text_fields(creation_input)
    error = validate_beneficiary_input(
        data,
        base_id=base_id,
        family_head=family_head,
        tags=tags,
        initial_credit=data.get("initial_credit"),
    )
    if error is not None:
        return error

    return create_beneficiary(**data, user_id=g.user.id)


@mutation.field("createBeneficiaries")
@handle_unauthorized
def resolve_create_beneficiaries(*_, creation_input):
    authorize(permission="beneficiary:create", base_id=creation_input["base_id"])
    authorize(permission="tag:read", base_id=creation_input["base_id"])
    authorize(permission="tags_relation:write")
    return create_beneficiaries(**creation_input, user_id=g.user.id)


@mutation.field("updateBeneficiary")
@handle_unauthorized
def resolve_update_beneficiary(*_, update_input):
    # Check existence
    beneficiary_id = update_input["id"]
    beneficiary = Beneficiary.get_or_none(Beneficiary.id == beneficiary_id)
    if beneficiary is None:
        return ResourceDoesNotExist(name="Beneficiary", id=beneficiary_id)
    family_head, tags, error = fetch_family_head_and_tags(
        update_input.get("family_head_id"), update_input.get("tag_ids")
    )
    if error is not None:
        return error

    # Authorize
    authorize(permission="beneficiary:edit", base_id=beneficiary.base_id)
    authorize(permission="tag:read", base_id=beneficiary.base_id)
    authorize(permission="tags_relation:write")

    # Validate
    data = strip_text_fields(update_input)
    error = validate_beneficiary_input(
        data,
        base_id=beneficiary.base_id,
        family_head=family_head,
        tags=tags,
        beneficiary=beneficiary,
        signature=data.get("signature"),
    )
    if error is not None:
        return error

    return update_beneficiary(**data, beneficiary=beneficiary, user_id=g.user.id)


def _unique(ids):
    """Remove duplicates, retain order."""
    return list(dict.fromkeys(ids))


def _require_permission(permission):
    """Raise Forbidden if the current user does not hold the permission for any base."""
    authorized_bases_filter(Beneficiary, permission=permission)


def _authorize_single_base(beneficiaries, permission):
    """Return an error if the beneficiaries are in different bases. Otherwise authorize
    the user for the permission in that base.
    """
    base_ids = {b.base_id for b in beneficiaries}
    if len(base_ids) > 1:
        return BeneficiaryBaseMismatch()
    if base_ids:
        authorize(permission=permission, base_id=base_ids.pop())


def _tags_operation(update_input, *, unassign):
    authorize(permission="tags_relation:write")
    _require_permission("beneficiary:edit")

    ids = _unique(update_input["ids"])
    tag_ids = set(update_input["tag_ids"])
    valid_tag_ids, tag_errors, tags_base_id = validate_tags(
        tag_ids,
        expected_type=TagType.Beneficiary,
        permission="beneficiary:edit",
        for_unassigning=unassign,
    )
    if not valid_tag_ids:
        return BeneficiariesTagsOperationResult(
            updated_beneficiaries=[],
            invalid_beneficiary_ids=[],
            tag_error_info=tag_errors,
        )

    # Beneficiaries in a base different from the tags' base are invalid
    beneficiaries, _ = find_beneficiaries(
        ids, IS_ACTIVE, Beneficiary.base == tags_base_id
    )
    beneficiary_ids = [b.id for b in beneficiaries]
    if unassign:
        # Beneficiaries without any of the requested tags are invalid
        assigned = assigned_tag_ids(beneficiary_ids, valid_tag_ids)
        beneficiaries = [b for b in beneficiaries if assigned[b.id]]
    else:
        # Beneficiaries that already have all of the requested tags are invalid
        missing = missing_tag_ids(beneficiary_ids, valid_tag_ids)
        beneficiaries = [b for b in beneficiaries if missing[b.id]]

    if error := _authorize_single_base(beneficiaries, "beneficiary:edit"):
        return error

    valid_ids = {b.id for b in beneficiaries}
    if unassign:
        updated_beneficiaries = unassign_tags_from_resources(
            user_id=g.user.id,
            model=Beneficiary,
            object_type=TaggableObjectType.Beneficiary,
            resource_ids=valid_ids,
            tag_ids=valid_tag_ids,
        )
    elif valid_ids:
        updated_beneficiaries = assign_tags_to_beneficiaries(
            user_id=g.user.id,
            beneficiary_ids=valid_ids,
            tag_ids=valid_tag_ids,
            now=utcnow(),
        )
    else:
        updated_beneficiaries = []

    return BeneficiariesTagsOperationResult(
        updated_beneficiaries=updated_beneficiaries,
        invalid_beneficiary_ids=sorted(set(ids).difference(valid_ids)),
        tag_error_info=tag_errors,
    )


@mutation.field("assignTagsToBeneficiaries")
@handle_unauthorized
def resolve_assign_tags_to_beneficiaries(*_, update_input):
    return _tags_operation(update_input, unassign=False)


@mutation.field("unassignTagsFromBeneficiaries")
@handle_unauthorized
def resolve_unassign_tags_from_beneficiaries(*_, update_input):
    return _tags_operation(update_input, unassign=True)


@mutation.field("deactivateBeneficiaries")
@handle_unauthorized
def resolve_deactivate_beneficiaries(*_, ids):
    permission = "beneficiary:delete"
    _require_permission(permission)

    ids = _unique(ids)
    beneficiaries, invalid_ids = find_beneficiaries(ids)
    if error := _authorize_single_base(beneficiaries, permission):
        return error

    return BeneficiariesResult(
        updated_beneficiaries=deactivate_beneficiaries(
            user_id=g.user.id, beneficiaries=beneficiaries, now=utcnow()
        ),
        invalid_beneficiary_ids=invalid_ids,
    )


@mutation.field("reactivateBeneficiaries")
@handle_unauthorized
def resolve_reactivate_beneficiaries(*_, ids):
    permission = "beneficiary:edit"
    _require_permission(permission)

    ids = _unique(ids)
    beneficiaries, _ = find_beneficiaries(ids, IS_DEACTIVATED)

    # Family members must not be reactivated if their family head stays deactivated
    head_ids = {b.family_head_id for b in beneficiaries if b.family_head_id}
    deactivated_head_ids = (
        {
            head.id
            for head in Beneficiary.select(Beneficiary.id).where(
                Beneficiary.id << list(head_ids), IS_DEACTIVATED
            )
        }
        if head_ids
        else set()
    )
    reactivated_ids = {b.id for b in beneficiaries}
    beneficiaries = [
        b
        for b in beneficiaries
        if b.family_head_id not in deactivated_head_ids
        or b.family_head_id in reactivated_ids
    ]

    if error := _authorize_single_base(beneficiaries, permission):
        return error

    return BeneficiariesResult(
        updated_beneficiaries=reactivate_beneficiaries(
            user_id=g.user.id, beneficiaries=beneficiaries, now=utcnow()
        ),
        invalid_beneficiary_ids=sorted(
            set(ids).difference(b.id for b in beneficiaries)
        ),
    )


@mutation.field("registerServicesForBeneficiaries")
@handle_unauthorized
def resolve_register_services_for_beneficiaries(*_, update_input):
    authorize(permission="services_relation:create")
    _require_permission("beneficiary:edit")

    ids = _unique(update_input["ids"])
    valid_service_ids, service_errors, services_base_id = validate_services(
        set(update_input["service_ids"])
    )
    if not valid_service_ids:
        return BeneficiariesServicesOperationResult(
            updated_beneficiaries=[],
            invalid_beneficiary_ids=[],
            service_error_info=service_errors,
        )

    # Beneficiaries in a base different from the services' base are invalid
    beneficiaries, invalid_ids = find_beneficiaries(
        ids, IS_ACTIVE, Beneficiary.base == services_base_id
    )
    if error := _authorize_single_base(beneficiaries, "beneficiary:edit"):
        return error

    updated_beneficiaries = (
        register_services_for_beneficiaries(
            user_id=g.user.id,
            beneficiary_ids=[b.id for b in beneficiaries],
            service_ids=valid_service_ids,
            now=utcnow(),
        )
        if beneficiaries
        else []
    )
    return BeneficiariesServicesOperationResult(
        updated_beneficiaries=updated_beneficiaries,
        invalid_beneficiary_ids=invalid_ids,
        service_error_info=service_errors,
    )


@mutation.field("mergeBeneficiariesIntoFamily")
@handle_unauthorized
def resolve_merge_beneficiaries_into_family(*_, ids):
    permission = "beneficiary:edit"
    _require_permission(permission)

    ids = _unique(ids)
    if len(ids) < 2:
        return SingleBeneficiaryForMerge()

    found, _ = find_beneficiaries(ids)
    # Family heads and individuals are merged. Their family members that are given as
    # well are moved along. Family members of other heads are invalid
    candidates = {b.id: b for b in found if b.family_head_id is None}
    members = [b for b in found if b.family_head_id in candidates]
    valid_ids = set(candidates).union(b.id for b in members)
    invalid_ids = sorted(set(ids).difference(valid_ids))
    if len(candidates) < 2:
        return SingleBeneficiaryForMerge()

    if error := _authorize_single_base([*candidates.values(), *members], permission):
        return error

    return BeneficiariesResult(
        updated_beneficiaries=merge_beneficiaries_into_family(
            user_id=g.user.id,
            beneficiaries=[candidates[i] for i in ids if i in candidates],
            now=utcnow(),
        ),
        invalid_beneficiary_ids=invalid_ids,
    )


@mutation.field("detachBeneficiariesFromFamily")
@handle_unauthorized
def resolve_detach_beneficiaries_from_family(*_, ids):
    permission = "beneficiary:edit"
    _require_permission(permission)

    ids = _unique(ids)
    found, _ = find_beneficiaries(ids)
    # Only family members can be detached
    beneficiaries = [b for b in found if b.family_head_id is not None]
    if error := _authorize_single_base(beneficiaries, permission):
        return error

    return BeneficiariesResult(
        updated_beneficiaries=(
            detach_beneficiaries_from_family(
                user_id=g.user.id, beneficiaries=beneficiaries, now=utcnow()
            )
            if beneficiaries
            else []
        ),
        invalid_beneficiary_ids=sorted(
            set(ids).difference(b.id for b in beneficiaries)
        ),
    )
