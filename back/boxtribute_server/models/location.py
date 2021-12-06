from peewee import SQL, CharField, DateTimeField, IntegerField

from ..db import db
from . import UIntDeferredForeignKey, UIntForeignKeyField
from .base import Base
from .box_state import BoxState


class Location(db.Model):
    box_state = UIntForeignKeyField(
        column_name="box_state_id",
        constraints=[SQL("DEFAULT 1")],
        field="id",
        model=BoxState,
        null=True,
        on_update="CASCADE",
    )
    base = UIntForeignKeyField(
        column_name="camp_id",
        field="id",
        model=Base,
        object_id_name="base_id",
    )
    is_stockroom = IntegerField(
        column_name="container_stock", constraints=[SQL("DEFAULT 0")]
    )
    created_on = DateTimeField(column_name="created", null=True)
    created_by = UIntDeferredForeignKey(
        "User",
        column_name="created_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    deleted = DateTimeField(null=True, default=None)
    is_donated = IntegerField(constraints=[SQL("DEFAULT 0")])
    is_lost = IntegerField(constraints=[SQL("DEFAULT 0")])
    is_market = IntegerField(constraints=[SQL("DEFAULT 0")])
    is_scrap = IntegerField(constraints=[SQL("DEFAULT 0")])
    name = CharField(column_name="label")
    last_modified_on = DateTimeField(column_name="modified", null=True)
    last_modified_by = UIntDeferredForeignKey(
        "User",
        column_name="modified_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    seq = IntegerField(null=True)
    visible = IntegerField(constraints=[SQL("DEFAULT 1")])

    class Meta:
        table_name = "locations"
