from peewee import SQL, CharField, IntegerField

from ..fields import UIntForeignKeyField
from . import Model


class ProductCategory(Model):
    name = CharField(column_name="label")
    parent = UIntForeignKeyField(
        column_name="parent_id",
        field="id",
        model="self",
        null=True,
        on_update="CASCADE",
    )
    seq = IntegerField(constraints=[SQL("DEFAULT 0")])

    class Meta:
        table_name = "product_categories"
