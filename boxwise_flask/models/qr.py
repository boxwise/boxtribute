from peewee import CharField, IntegerField
from playhouse.shortcuts import model_to_dict

from ..db import db


class Qrs(db.Model):
    id = IntegerField()
    code = CharField()

    class Meta:
        table_name = "qr"

    def __str__(self):
        return self.id

    @staticmethod
    def get_qr(barcode):
        qr = Qrs.select().where(Qrs.code == barcode).get()

        return qr
