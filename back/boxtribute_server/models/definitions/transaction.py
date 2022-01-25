from peewee import SQL, CharField, DateTimeField, IntegerField

from ...db import db
from ..fields import UIntForeignKeyField
from .beneficiary import Beneficiary
from .product import Product
from .user import User


class Transaction(db.Model):
    beneficiary = UIntForeignKeyField(
        column_name="people_id",
        field="id",
        model=Beneficiary,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    count = IntegerField()
    created = DateTimeField(null=True)
    created_by = UIntForeignKeyField(
        model=User,
        column_name="created_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    description = CharField()
    tokens = IntegerField(column_name="drops", constraints=[SQL("DEFAULT 0")])
    modified = DateTimeField(null=True)
    modified_by = UIntForeignKeyField(
        model=User,
        column_name="modified_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    product = UIntForeignKeyField(
        column_name="product_id",
        field="id",
        model=Product,
        null=True,
        on_update="CASCADE",
    )
    transaction_date = DateTimeField(index=True)
    user = UIntForeignKeyField(
        model=User,
        column_name="user_id",
        field="id",
        null=True,
        on_update="CASCADE",
        on_delete="SET NULL",
    )

    class Meta:
        table_name = "transactions"
