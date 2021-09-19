from boxwise_flask.db import db
from boxwise_flask.models.base import Base
from boxwise_flask.models.box_state import BoxState
from boxwise_flask.models.user import User
from peewee import SQL, CharField, DateTimeField, ForeignKeyField, IntegerField


class Location(db.Model):
    box_state = ForeignKeyField(
        column_name="box_state_id",
        constraints=[SQL("DEFAULT 1")],
        field="id",
        model=BoxState,
        null=True,
        on_update="CASCADE",
    )
    base = ForeignKeyField(column_name="base_id", field="id", model=Base)
    is_stockroom = IntegerField(constraints=[SQL("DEFAULT 0")])
    created = DateTimeField(null=True)
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
    modified = DateTimeField(null=True)
    modified_by = ForeignKeyField(
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

    @staticmethod
    def get_location(location_id):
        return Location.get(Location.id == location_id)

    @staticmethod
    def get_all():
        return Location.select()
