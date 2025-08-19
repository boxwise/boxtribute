import hashlib

from ....db import db
from ....errors import DeletedLocation, ResourceDoesNotExist
from ....models.definitions.box import Box
from ....models.definitions.history import DbChangeHistory
from ....models.definitions.location import Location
from ....models.definitions.product import Product
from ....models.definitions.qr_code import QrCode
from ....models.utils import utcnow


def create_qr_code(*, user_id, box_label_identifier=None):
    """Insert a new QR code in the database. Generate an MD5 hash based on its primary
    key. If a `box_label_identifier` is passed, look up the corresponding box (it is
    expected to exist) and associate the QR code with it.
    Return the newly created QR code.

    All operations are run inside an atomic transaction. If e.g. the box look-up fails,
    the operations are rolled back (i.e. no new QR code is inserted).
    """
    box = None
    if box_label_identifier is not None:
        box = (
            Box.select(
                Box,
                Product.deleted_on,
                Product.name,
                Location.deleted_on,
                Location.name,
            )
            .join(Product)
            .join(Location, src=Box)
            .where(Box.label_identifier == box_label_identifier)
            .get_or_none()
        )

        if box is None:
            return ResourceDoesNotExist(name="Box")

        if box.location.deleted_on is not None:
            return DeletedLocation(name=box.location.name)

    with db.database.atomic():
        now = utcnow()
        new_qr_code = QrCode.create(created_on=now)
        new_qr_code.code = hashlib.md5(
            str(new_qr_code.id).encode(), usedforsecurity=False
        ).hexdigest()
        new_qr_code.save()

        DbChangeHistory.create(
            changes="New QR-code generated",  # text copied from dropapp
            table_name=new_qr_code._meta.table_name,
            record_id=new_qr_code.id,
            user=user_id,
            ip=None,
            change_date=now,
        )

        if box is not None:
            box.qr_code = new_qr_code.id
            box.save()

    return new_qr_code
