from ariadne import ObjectType

from ....authz import authorize_for_organisation_bases
from ....graph_ql.filtering import derive_base_filter
from ....models.definitions.base import Base

organisation = ObjectType("Organisation")


@organisation.field("bases")
def resolve_organisation_bases(organisation_obj, _, filter_input=None):
    authorize_for_organisation_bases()
    conditions = derive_base_filter(filter_input)
    return Base.select().where(Base.organisation_id == organisation_obj.id, *conditions)
