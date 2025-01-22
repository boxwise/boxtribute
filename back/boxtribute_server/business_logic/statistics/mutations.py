from ariadne import MutationType
from flask import g

# from ...authz import authorize
from .crud import create_shareable_link

mutation = MutationType()


@mutation.field("createShareableLink")
def resolve_create_shareable_link(*_, creation_input):
    # authorize(permission="shareable_link:write", base_id=creation_input["base_id"])
    return create_shareable_link(user_id=g.user.id, **creation_input)
