from peewee import DateTimeField

from ..fields import UIntForeignKeyField
from . import Model
from .beneficiary import Beneficiary
from .service import Service
from .user import User


class ServicesRelation(Model):
    beneficiary = UIntForeignKeyField(
        column_name="people_id",
        field="id",
        model=Beneficiary,
        on_delete="RESTRICT",
        on_update="CASCADE",
    )
    service = UIntForeignKeyField(
        column_name="service_id",
        field="id",
        model=Service,
        on_delete="RESTRICT",
        on_update="CASCADE",
    )
    created_on = DateTimeField(column_name="created")
    created_by = UIntForeignKeyField(
        column_name="created_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )

    class Meta:
        table_name = "services_relations"
