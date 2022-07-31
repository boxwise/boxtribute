from boxtribute_server.enums import DistributionEventState
from peewee import CharField, DateTimeField

from ...db import db
from ..fields import EnumCharField, UIntForeignKeyField
from .location import Location
from .user import User


class DistributionEvent(db.Model):
    name = CharField(null=True)
    planned_start_date_time = DateTimeField()
    planned_end_date_time = DateTimeField()
    # TODO: Clarify whether this is enough to make the connection
    # to DistributionSpot or whether some additional constraints
    # are needed (since the same table / PeeWee model is used as for locations)
    distribution_spot = UIntForeignKeyField(
        column_name="location_id",
        object_id_name="distribution_spot_id",
        model=Location,
    )
    state = EnumCharField(
        choices=DistributionEventState, default=DistributionEventState.Planning
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
    modified_on = DateTimeField(null=True)
    modified_by = UIntForeignKeyField(
        model=User,
        column_name="modified_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )

    class Meta:
        table_name = "distro_events"
