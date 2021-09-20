from boxwise_flask.db import db
from peewee import SQL, CharField, DateTimeField, IntegerField


class QRCode(db.Model):
    code = CharField(null=True)
    created_on = DateTimeField(column_name="created", null=True)
    legacy = IntegerField(constraints=[SQL("DEFAULT 0")])

    class Meta:
        table_name = "qr"
        indexes = ((("code", "legacy"), True),)

    def __str__(self):
        return self.id

    @staticmethod
    def get_id_from_code(code):
        return QRCode.get(QRCode.code == code).id
