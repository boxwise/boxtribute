"""Validation of tags that are assigned to/unassigned from resources (boxes,
beneficiaries).
"""

from sentry_sdk import capture_message as emit_sentry_message

from ...authz import authorize, handle_unauthorized
from ...enums import TagType
from ...errors import DeletedTag, ResourceDoesNotExist, TagBaseMismatch, TagTypeMismatch
from ...models.definitions.tag import Tag

RESOURCE_NAMES = {TagType.Box: "boxes", TagType.Beneficiary: "beneficiaries"}


@handle_unauthorized
def authorize_tag(tag, *, permission):
    """Authorize for reading the tag and for the given permission (e.g. 'stock:write')
    in the tag's base. Return a user error if unauthorized.
    """
    authorize(permission="tag:read", base_id=tag.base_id)
    authorize(permission=permission, base_id=tag.base_id)


def validate_tags(tag_ids, *, expected_type, permission, for_unassigning=False):
    """Validate tags for given IDs. Tags of type `expected_type` or `TagType.All` are
    valid. `permission` is the permission required in the tags' bases.
    Return tuple consisting of:
    - list of IDs of valid tags
    - list of info about erroneous tags (non-existing, unauthorized for, deleted, or
      mismatching type)
    - ID of common base of all tags, if there's a single base, otherwise None
    """
    tag_errors = []
    valid_tags = []
    for tag_id in tag_ids:
        if (tag := Tag.get_or_none(tag_id)) is None:
            tag_errors.append(
                {"id": tag_id, "error": ResourceDoesNotExist(name="Tag", id=tag_id)}
            )
            continue

        if (error := authorize_tag(tag, permission=permission)) is not None:
            tag_errors.append({"id": tag_id, "error": error})
            continue

        if for_unassigning:
            # For unassigning it's valid to operate with deleted or type-mismatched tags
            valid_tags.append(tag)
            continue

        if tag.deleted_on is not None:
            tag_errors.append({"id": tag_id, "error": DeletedTag(name=tag.name)})
            continue

        if tag.type not in (expected_type, TagType.All):
            tag_errors.append(
                {"id": tag_id, "error": TagTypeMismatch(expected_type=expected_type)}
            )
            continue

        valid_tags.append(tag)

    tag_base_ids = {tag.base_id for tag in valid_tags}
    # All requested tags must be registered in the same base
    if len(tag_base_ids) > 1:
        # None of the tags is valid; return errors for all of them
        return (
            [],
            tag_errors
            + [{"id": tag_id, "error": TagBaseMismatch()} for tag_id in tag_ids],
            None,
        )
    elif len(tag_base_ids) == 1:
        tags_base_id = list(tag_base_ids)[0]
    else:
        tags_base_id = None

    if for_unassigning:
        resources = RESOURCE_NAMES[expected_type]
        for tag in valid_tags:
            if tag.deleted_on is not None:
                # When a tag is deleted, it is also unassigned from any resource, hence
                # in theory unassigning a deleted tag should not happen. However we have
                # to deal with legacy data (there are 1.3k boxes assigned to deleted
                # tags) and want to be notified about it.
                emit_sentry_message(
                    f"User unassigned deleted tag from {resources}",
                    level="warning",
                    extras={"tag_id": tag.id},
                )
            if tag.type not in (expected_type, TagType.All):
                # When a tag type changes, it is also unassigned from any resource,
                # hence in theory resources assigned with a tag of mismatching type
                # should not occur. However we have to deal with legacy data and want
                # to be notified about it.
                emit_sentry_message(
                    f"User unassigned {tag.type.name}-type tag from {resources}",
                    level="warning",
                    extras={"tag_id": tag.id},
                )

    return [tag.id for tag in valid_tags], tag_errors, tags_base_id
