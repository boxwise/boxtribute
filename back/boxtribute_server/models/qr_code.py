from peewee import SQL, CharField, DateTimeField, IntegerField

from ..db import db


class QrCode(db.Model):
    code = CharField(null=True)
    created_on = DateTimeField(column_name="created", null=True)
    legacy = IntegerField(constraints=[SQL("DEFAULT 0")])

    class Meta:
        table_name = "qr"
        indexes = ((("code", "legacy"), True),)

    @staticmethod
    def get_id_from_code(code):
        return QrCode.get(QrCode.code == code).id
