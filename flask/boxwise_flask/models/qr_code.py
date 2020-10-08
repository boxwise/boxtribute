from peewee import SQL, CharField, DateTimeField, IntegerField

from boxwise_flask.db import db


class QRCode(db.Model):
    code = CharField(null=True)
    created = DateTimeField(null=True)
    legacy = IntegerField(constraints=[SQL("DEFAULT 0")])

    class Meta:
        table_name = "qr"
        indexes = ((("code", "legacy"), True),)

    def __str__(self):
        return self.id

    @staticmethod
    def get_id_from_code(code):
        qr_id = QRCode.select(QRCode.id).where(QRCode.code == code).get()
        return qr_id.id
