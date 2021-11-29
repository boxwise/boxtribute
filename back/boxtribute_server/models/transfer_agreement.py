from peewee import ForeignKeyField

from ..db import db
from .organisation import Organisation


class TransferAgreement(db.Model):
    source_organisation = ForeignKeyField(model=Organisation, on_update="CASCADE")
    target_organisation = ForeignKeyField(model=Organisation, on_update="CASCADE")
