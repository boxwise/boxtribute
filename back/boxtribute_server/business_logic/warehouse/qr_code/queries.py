from ariadne import QueryType

from ....authz import authorize
from ....models.definitions.qr_code import QrCode

query = QueryType()


@query.field("qrExists")
def resolve_qr_exists(*_, qr_code):
    authorize(permission="qr:read")
    try:
        QrCode.get_id_from_code(qr_code)
    except QrCode.DoesNotExist:
        return False
    return True


@query.field("qrCode")
def resolve_qr_code(*_, qr_code):
    authorize(permission="qr:read")
    return QrCode.get(QrCode.code == qr_code)
