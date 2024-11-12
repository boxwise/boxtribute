from ariadne import ObjectType
from flask import g

from ...authz import authorize, authorized_bases_filter
from ...models.definitions.base import Base

user = ObjectType("User")


@user.field("bases")
def resolve_bases(user_obj, _):
    if user_obj.id != g.user.id:
        # If the queried user is different from the current user, we don't have a way
        # yet to fetch secure information about that user's bases; it would require
        # accessing Auth0 to find out if the current user has sufficient permission.
        # For now, null is returned
        return

    if g.user.is_god:
        # God user have access to all bases
        return Base.select()

    return Base.select().where(authorized_bases_filter())


@user.field("email")
def resolve_user_email(user_obj, _):
    authorize(user_id=user_obj.id)
    return user_obj.email


@user.field("organisation")
def resolve_user_organisation(user_obj, info):
    if user_obj.id != g.user.id:
        # If the queried user is different from the current user, we don't have a way
        # yet to fetch information about that user's organisation
        return

    if g.user.is_god:
        # God user does not belong to an organisation
        return

    return info.context["organisation_loader"].load(g.user.organisation_id)
