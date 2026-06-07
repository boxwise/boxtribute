from peewee import CompositeKey

from ..fields import UIntForeignKeyField
from . import Model
from .size import Size
from .size_range import SizeRange


class SizeRangeSize(Model):
    size = UIntForeignKeyField(
        column_name="size_id",
        field="id",
        model=Size,
        object_id_name="size_id",
        on_delete="CASCADE",
        on_update="CASCADE",
    )
    size_range = UIntForeignKeyField(
        column_name="sizegroup_id",
        field="id",
        model=SizeRange,
        object_id_name="size_range_id",
        on_delete="CASCADE",
        on_update="CASCADE",
    )

    class Meta:
        table_name = "sizes_sizegroup"
        primary_key = CompositeKey("size", "size_range")
