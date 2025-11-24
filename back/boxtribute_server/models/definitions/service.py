from peewee import CharField, DateTimeField, IntegerField, TextField

from ...db import db
from ..fields import UIntForeignKeyField
from .base import Base
from .beneficiary import Beneficiary
from .user import User


class Service(db.Model):  # type: ignore
    name = CharField(column_name="label")
    description = TextField()
    base = UIntForeignKeyField(
        column_name="camp_id",
        field="id",
        model=Base,
        on_delete="RESTRICT",
        on_update="CASCADE",
    )
    deleted_on = DateTimeField(column_name="deleted", null=True)
    deleted_by = UIntForeignKeyField(
        column_name="deleted_by",
        field="id",
        model=User,
        null=True,
        on_delete="RESTRICT",
        on_update="CASCADE",
    )
    created_on = DateTimeField(column_name="created", null=True)
    created_by = UIntForeignKeyField(
        column_name="created_by",
        field="id",
        model=User,
        null=True,
        on_delete="RESTRICT",
        on_update="CASCADE",
    )
    last_modified_on = DateTimeField(column_name="modified", null=True)
    last_modified_by = UIntForeignKeyField(
        column_name="modified_by",
        field="id",
        model=User,
        null=True,
        on_delete="RESTRICT",
        on_update="CASCADE",
    )
    seq = IntegerField(null=True)

    class Meta:
        table_name = "services"


class ServicesRelation(db.Model):  # type: ignore
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
