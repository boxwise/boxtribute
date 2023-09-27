from ariadne import MutationType

from ....authz import authorize
from .crud import create_qr_code

mutation = MutationType()


@mutation.field("createQrCode")
def resolve_create_qr_code(*_, box_label_identifier=None):
    authorize(permission="qr:create")
    return create_qr_code(box_label_identifier=box_label_identifier)
