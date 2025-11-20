from ariadne import ObjectType

from ...authz import authorize

tag = ObjectType("Tag")


@tag.field("taggedResources")
def resolve_tag_tagged_resources(tag_obj, info):
    return info.context["resources_for_tag_loader"].load(tag_obj.id)


@tag.field("base")
def resolve_tag_base(tag_obj, info):
    authorize(permission="base:read", base_id=tag_obj.base_id)
    return info.context["base_loader"].load(tag_obj.base_id)


@tag.field("createdBy")
def resolve_tag_created_by(tag_obj, info):
    return info.context["user_loader"].load(tag_obj.created_by_id)


@tag.field("lastModifiedBy")
def resolve_tag_last_modified_by(tag_obj, info):
    return info.context["user_loader"].load(tag_obj.last_modified_by_id)
