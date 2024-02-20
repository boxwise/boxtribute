from ariadne import ObjectType

from ....authz import authorize_for_reading_box
from ....models.definitions.box import Box
from ....models.definitions.location import Location

qr_code = ObjectType("QrCode")


@qr_code.field("box")
def resolve_qr_code_box(qr_code_obj, _):
    try:
        box = (
            Box.select(Box, Location)
            .join(Location)
            .where(Box.qr_code == qr_code_obj.id)
            .get()
        )
        authorize_for_reading_box(box)
    except Box.DoesNotExist:
        box = None
    return box
