from ariadne import ObjectType

from ....authz import authorize_for_organisation_bases
from ....models.definitions.base import Base

organisation = ObjectType("Organisation")


@organisation.field("bases")
def resolve_organisation_bases(organisation_obj, _):
    authorize_for_organisation_bases()
    return Base.select().where(Base.organisation_id == organisation_obj.id)
