from peewee import CharField, DecimalField

from ..fields import UIntForeignKeyField
from . import Model
from .size_range import SizeRange


class Unit(Model):
    name = CharField()
    symbol = CharField()
    conversion_factor = DecimalField(max_digits=36, decimal_places=18)
    dimension = UIntForeignKeyField(
        model=SizeRange,
        on_update="CASCADE",
        on_delete="RESTRICT",
    )

    class Meta:
        table_name = "units"
