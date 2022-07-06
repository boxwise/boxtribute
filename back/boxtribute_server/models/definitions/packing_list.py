from peewee import DateTimeField

from ...db import db
from ..fields import UIntForeignKeyField
from .distribution_event import DistributionEvent
from .user import User


class PackingList(db.Model):
    distribution_event = UIntForeignKeyField(
        column_name="distribution_event_id", field="id", model=DistributionEvent
    )
    created_on = DateTimeField(column_name="created", null=True)
    created_by = UIntForeignKeyField(
        model=User,
        column_name="created_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    last_modified_on = DateTimeField(column_name="modified", null=True)
    last_modified_by = UIntForeignKeyField(
        model=User,
        column_name="modified_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )

    class Meta:
        table_name = "packing_list"
