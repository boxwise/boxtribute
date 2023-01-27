from ariadne import MutationType, convert_kwargs_to_snake_case

from ....authz import authorize
from .crud import create_qr_code

mutation = MutationType()


@mutation.field("createQrCode")
@convert_kwargs_to_snake_case
def resolve_create_qr_code(*_, box_label_identifier=None):
    authorize(permission="qr:create")
    return create_qr_code(box_label_identifier=box_label_identifier)
