from ariadne import ObjectType
from flask import g

from ..authz import authorize, authorized_bases_filter
from ..models.definitions.base import Base
from ..models.definitions.organisation import Organisation

user = ObjectType("User")


@user.field("bases")
def resolve_bases(*_):
    return Base.select().where(authorized_bases_filter())


@user.field("email")
def resolve_user_email(user_obj, _):
    authorize(user_id=user_obj.id)
    return user_obj.email


@user.field("organisation")
def resolve_user_organisation(*_):
    return Organisation.get_by_id(g.user.organisation_id)
