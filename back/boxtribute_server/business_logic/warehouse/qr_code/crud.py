import hashlib

from ....db import db
from ....models.definitions.box import Box
from ....models.definitions.history import DbChangeHistory
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
    with db.database.atomic():
        now = utcnow()
        new_qr_code = QrCode.create(created_on=now)
        new_qr_code.code = hashlib.md5(
            str(new_qr_code.id).encode(), usedforsecurity=False
        ).hexdigest()
        new_qr_code.save()

        if box_label_identifier is not None:
            box = Box.get(Box.label_identifier == box_label_identifier)
            box.qr_code = new_qr_code.id
            box.save()
            DbChangeHistory.create(
                changes="New Qr-code assigned by pdf generation.",
                table_name=box._meta.table_name,
                record_id=box.id,
                user=user_id,
                ip=None,
                change_date=now,
            )

    return new_qr_code
