from boxtribute_server.enums import DistributionEventsTrackingGroupState
from peewee import CharField, DateTimeField

from ...db import db
from ..fields import EnumCharField, UIntForeignKeyField
from .base import Base
from .user import User


class DistributionEventsTrackingGroup(db.Model):
    name = CharField(null=True)
    base = UIntForeignKeyField(
        # TODO: in the database, this is still called camp_id
        # either change the database or change the model everywhere
        column_name="base_id",
        field="id",
        model=Base,
        object_id_name="base_id",
    )
    state = EnumCharField(
        choices=DistributionEventsTrackingGroupState,
        default=DistributionEventsTrackingGroupState.InProgress,
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
        table_name = "distro_events_tracking_groups"
