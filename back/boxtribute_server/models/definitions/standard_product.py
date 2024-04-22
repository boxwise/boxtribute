from peewee import CharField, DateTimeField, IntegerField

from ...db import db
from ..fields import UIntForeignKeyField
from ..utils import utcnow
from .product_category import ProductCategory
from .product_gender import ProductGender
from .size_range import SizeRange
from .user import User


class StandardProduct(db.Model):
    name = CharField()
    category = UIntForeignKeyField(
        model=ProductCategory,
        on_update="CASCADE",
        object_id_name="category_id",
    )
    gender = UIntForeignKeyField(
        model=ProductGender,
        on_update="CASCADE",
        object_id_name="gender_id",
    )
    size_range = UIntForeignKeyField(
        model=SizeRange,
        on_update="CASCADE",
        object_id_name="size_range_id",
    )
    version = IntegerField()
    added_on = DateTimeField(default=utcnow)
    added_by = UIntForeignKeyField(
        model=User,
        column_name="added_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    deprecated_on = DateTimeField(null=True)
    deprecated_by = UIntForeignKeyField(
        model=User,
        column_name="deprecated_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    preceded_by_product = UIntForeignKeyField(
        model="self",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    superceded_by_product = UIntForeignKeyField(
        model="self",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )

    class Meta:
        legacy_table_names = False
