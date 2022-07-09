# from boxtribute_server.models.definitions.distribution_spot import DistributionSpot
from boxtribute_server.enums import DistributionEventState
from peewee import CharField, DateTimeField

from ...db import db
from ..fields import EnumCharField, UIntForeignKeyField
from .location import Location
from .user import User


class DistributionEvent(db.Model):
    # TODO: consider to place DistributionEvents under bases/locations
    # (but at least organizations)

    # base = UIntForeignKeyField(
    #     column_name="camp_id",
    #     field="id",
    #     model=Base,
    #     object_id_name="base_id",
    # )
    name = CharField(null=True)
    planned_start_date_time = DateTimeField(column_name="planned_start_date_time")
    planned_end_date_time = DateTimeField(column_name="planned_end_date_time")
    distribution_spot = UIntForeignKeyField(
        column_name="location_id",
        object_id_name="distribution_spot_id",
        model=Location,
    )
    state = EnumCharField(
        choices=DistributionEventState,
        default=DistributionEventState.Planning,
    )

    created_on = DateTimeField(null=True)
    created_by = UIntForeignKeyField(
        model=User,
        column_name="created_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    deleted_on = DateTimeField(null=True, default=None)
    last_modified_on = DateTimeField(null=True)
    last_modified_by = UIntForeignKeyField(
        model=User,
        column_name="last_modified_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )

    class Meta:
        table_name = "distribution_events"
