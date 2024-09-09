from ariadne import QueryType

from ....authz import authorize, handle_unauthorized
from ....models.definitions.qr_code import QrCode
from ....models.utils import handle_non_existing_resource

query = QueryType()


@query.field("qrExists")
def resolve_qr_exists(*_, code):
    authorize(permission="qr:read")
    try:
        QrCode.get_id_from_code(code)
    except QrCode.DoesNotExist:
        return False
    return True


@query.field("qrCode")
@handle_unauthorized
@handle_non_existing_resource
def resolve_qr_code(*_, code):
    authorize(permission="qr:read")
    return QrCode.get(QrCode.code == code)
