from peewee import CharField, IntegerField

from ..db import db


class Qr(db.Model):
    code = CharField()

    class Meta:
        table_name = "qr"

    def __str__(self):
        return self.id

    @staticmethod
    def get_qr(barcode):
        qr = Qr.select().where(Qr.code == barcode).get()

        return qr
