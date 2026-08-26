import hashlib

from ....db import db
from ....models.definitions.box import Box
from ....models.definitions.history import DbChangeHistory
from ....models.definitions.qr_code import QrCode
from ....models.utils import utcnow


def create_qr_code(*, user_id, box=None):
    """Insert a new QR code in the database. Generate an MD5 hash based on its primary
    key. If a `box` is passed, associate the QR code with it.
    Return the newly created QR code.
    """
    with db.database.atomic():
        now = utcnow()
        new_qr_code = QrCode.create(created_on=now)
        new_qr_code.code = hashlib.md5(
            str(new_qr_code.id).encode(), usedforsecurity=False
        ).hexdigest()
        new_qr_code.save()

        if box is not None:
            box.qr_code = new_qr_code.id
            box.save(only=[Box.qr_code])
            DbChangeHistory.create(
                changes="New Qr-code assigned by pdf generation.",
                table_name=box._meta.table_name,
                record_id=box.id,
                user=user_id,
                ip=None,
                change_date=now,
            )

    return new_qr_code
