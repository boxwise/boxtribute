from ariadne import MutationType
from flask import g

from ....authz import authorize, authorize_for_accessing_box
from ....models.definitions.box import Box
from ....models.definitions.location import Location
from .crud import create_qr_code

mutation = MutationType()


@mutation.field("createQrCode")
def resolve_create_qr_code(*_, box_label_identifier=None):
    authorize(permission="qr:create")

    box = None
    if box_label_identifier is not None:
        box = (
            Box.select(Box, Location)
            .join(Location)
            .where(Box.label_identifier == box_label_identifier)
            .get()
        )
        authorize_for_accessing_box(box, action="write")

    return create_qr_code(user_id=g.user.id, box=box)
