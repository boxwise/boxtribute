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
    description = CharField()
    tokens = IntegerField(column_name="drops", constraints=[SQL("DEFAULT 0")])
    product = UIntForeignKeyField(
        column_name="product_id",
        field="id",
        model=Product,
        null=True,
        on_update="CASCADE",
    )
    created_on = DateTimeField(column_name="transaction_date", index=True)
    # Albeit the underlying MySQL table has a 'created_by' column defined it is never
    # used in dropapp. For consistency with other FK fields to the User model the
    # 'user_id' column is aliased as 'created_by' and exposed
    created_by = UIntForeignKeyField(
        model=User,
        column_name="user_id",
        field="id",
        null=True,
        on_update="CASCADE",
        on_delete="SET NULL",
    )

    class Meta:
        table_name = "transactions"
