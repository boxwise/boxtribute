# from boxtribute_server.models.definitions.distribution_spot import DistributionSpot
from peewee import CharField, DateTimeField

from ...db import db
from ..fields import UIntForeignKeyField
from .location import Location
from .user import User


class DistributionEvent(db.Model):
    # base = UIntForeignKeyField(
    #     column_name="camp_id",
    #     field="id",
    #     model=Base,
    #     object_id_name="base_id",
    # )
    name = CharField(null=True)
    start_date_time = DateTimeField()
    end_date_time = DateTimeField(null=True)
    distribution_spot = UIntForeignKeyField(
        column_name="location_id",
        object_id_name="distribution_spot_id",
        # field="id",
        model=Location,
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
    deleted = DateTimeField(null=True, default=None)
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
        table_name = "distribution_events"
