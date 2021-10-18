from peewee import SQL, CharField, DateTimeField, ForeignKeyField, IntegerField

from ..db import db
from .base import Base
from .product_category import ProductCategory
from .product_gender import ProductGender
from .size_range import SizeRange
from .user import User


class Product(db.Model):
    base = ForeignKeyField(
        column_name="camp_id",
        field="id",
        model=Base,
        null=True,
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    category = ForeignKeyField(
        column_name="category_id",
        field="id",
        model=ProductCategory,
        null=True,
        constraints=[SQL("UNSIGNED")],
    )
    comments = CharField(null=True)
    created_on = DateTimeField(column_name="created", null=True)
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
    gender = ForeignKeyField(
        column_name="gender_id",
        field="id",
        model=ProductGender,
        on_update="CASCADE",
    )
    last_modified_on = DateTimeField(column_name="modified", null=True)
    last_modified_by = ForeignKeyField(
        column_name="modified_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    name = CharField()
    size_range = ForeignKeyField(
        column_name="sizegroup_id",
        field="id",
        model=SizeRange,
        null=True,
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    in_shop = IntegerField(
        column_name="stockincontainer", constraints=[SQL("DEFAULT 0")]
    )
    price = IntegerField(column_name="value", constraints=[SQL("DEFAULT 0")])

    class Meta:
        table_name = "products"
