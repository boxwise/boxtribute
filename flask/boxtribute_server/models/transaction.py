from peewee import SQL, CharField, DateTimeField, ForeignKeyField, IntegerField

from ..db import db
from .beneficiary import Beneficiary
from .product import Product
from .size import Size
from .user import User


class Transaction(db.Model):
    beneficiary = ForeignKeyField(
        column_name="people_id",
        field="id",
        model=Beneficiary,
        null=True,
        on_update="CASCADE",
    )
    count = IntegerField()
    created = DateTimeField(null=True)
    created_by = ForeignKeyField(
        column_name="created_by", field="id", model=User, null=True, on_update="CASCADE"
    )
    description = CharField()
    drops = IntegerField(constraints=[SQL("DEFAULT 0")])
    modified = DateTimeField(null=True)
    modified_by = ForeignKeyField(
        column_name="modified_by",
        field="id",
        model=User,
        null=True,
        on_update="CASCADE",
    )
    product = ForeignKeyField(
        column_name="product_id",
        field="id",
        model=Product,
        null=True,
        on_update="CASCADE",
    )
    size = ForeignKeyField(
        column_name="size_id", field="id", model=Size, null=True, on_update="CASCADE"
    )
    transaction_date = DateTimeField(index=True)
    user = ForeignKeyField(
        column_name="user_id", field="id", model=User, null=True, on_update="CASCADE"
    )

    class Meta:
        table_name = "transactions"
