from ariadne import ObjectType

from ...authz import authorize
from ...models.definitions.box import Box
from ...models.definitions.location import Location

qr_code = ObjectType("QrCode")


@qr_code.field("box")
def resolve_qr_code_box(qr_code_obj, _):
    box = Box.select().join(Location).where(Box.qr_code == qr_code_obj.id).get()
    authorize(permission="stock:read", base_id=box.location.base_id)
    return box
