from ariadne import ObjectType

from ...authz import authorize, authorized_bases_filter
from ...enums import TaggableObjectType
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.box import Box
from ...models.definitions.tags_relation import TagsRelation

tag = ObjectType("Tag")


@tag.field("taggedResources")
def resolve_tag_tagged_resources(tag_obj, _):
    authorize(permission="tag_relation:read")
    beneficiary_relations = TagsRelation.select(TagsRelation.object_id).where(
        (TagsRelation.tag == tag_obj.id)
        & (TagsRelation.object_type == TaggableObjectType.Beneficiary)
        & (TagsRelation.deleted_on.is_null())
    )
    box_relations = TagsRelation.select(TagsRelation.object_id).where(
        (TagsRelation.tag == tag_obj.id)
        & (TagsRelation.object_type == TaggableObjectType.Box)
        & (TagsRelation.deleted_on.is_null())
    )
    return list(
        Beneficiary.select().where(
            Beneficiary.id << [r.object_id for r in beneficiary_relations],
            authorized_bases_filter(Beneficiary),
        )
    ) + list(Box.select().where(Box.id << [r.object_id for r in box_relations]))


@tag.field("base")
def resolve_tag_base(tag_obj, info):
    authorize(permission="base:read", base_id=tag_obj.base_id)
    return info.context["base_loader"].load(tag_obj.base_id)
