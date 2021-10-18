from peewee import SQL, CharField, DateTimeField, ForeignKeyField, IntegerField

from ..db import db
from .base import Base
from .box_state import BoxState
from .user import User


class Location(db.Model):
    box_state = ForeignKeyField(
        column_name="box_state_id",
        constraints=[SQL("DEFAULT 1")],
        field="id",
        model=BoxState,
        null=True,
        on_update="CASCADE",
    )
    base = ForeignKeyField(column_name="camp_id", field="id", model=Base)
    is_stockroom = IntegerField(
        column_name="container_stock", constraints=[SQL("DEFAULT 0")]
    )
    created_on = DateTimeField(column_name="created", null=True)
    created_by = ForeignKeyField(
        column_name="created_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    deleted = DateTimeField(null=True, default=None)
    is_donated = IntegerField(constraints=[SQL("DEFAULT 0")])
    is_lost = IntegerField(constraints=[SQL("DEFAULT 0")])
    is_market = IntegerField(constraints=[SQL("DEFAULT 0")])
    is_scrap = IntegerField(constraints=[SQL("DEFAULT 0")])
    name = CharField(column_name="label")
    last_modified_on = DateTimeField(column_name="modified", null=True)
    last_modified_by = ForeignKeyField(
        column_name="modified_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    seq = IntegerField(null=True)
    visible = IntegerField(constraints=[SQL("DEFAULT 1")])

    class Meta:
        table_name = "locations"
