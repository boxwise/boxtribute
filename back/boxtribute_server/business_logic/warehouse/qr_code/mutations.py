from ariadne import MutationType
from flask import g

from ....authz import authorize, handle_unauthorized
from .crud import create_qr_code

mutation = MutationType()


@mutation.field("createQrCode")
@handle_unauthorized
def resolve_create_qr_code(*_, box_label_identifier=None):
    authorize(permission="qr:create")
    return create_qr_code(user_id=g.user.id, box_label_identifier=box_label_identifier)
