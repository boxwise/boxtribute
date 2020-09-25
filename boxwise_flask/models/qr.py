from peewee import CharField

from ..db import db


class Qr(db.Model):
    code = CharField()

    def __str__(self):
        return self.id

    @staticmethod
    def get_id_from_code(code):
        qr_id = Qr.select(Qr.id).where(Qr.code == code).get()
        return qr_id.id
