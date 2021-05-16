from boxwise_flask.db import db
from boxwise_flask.models import UnsignedIntegerField
from boxwise_flask.models.base import Base
from boxwise_flask.models.product_category import ProductCategory
from boxwise_flask.models.product_gender import ProductGender
from boxwise_flask.models.size_range import SizeRange
from boxwise_flask.models.user import User
from peewee import SQL, CharField, DateTimeField, ForeignKeyField, IntegerField


class Product(db.Model):
    id = UnsignedIntegerField(primary_key=True)
    base = ForeignKeyField(column_name="camp_id", field="id", model=Base, null=True)
    product_category = ForeignKeyField(
        column_name="category_id", field="id", model=ProductCategory, null=True
    )
    comments = CharField(null=True)
    created = DateTimeField(null=True)
    created_by = ForeignKeyField(
        column_name="created_by", field="id", model=User, null=True
    )
    deleted = DateTimeField(null=True, default=None)
    product_gender = ForeignKeyField(
        column_name="gender_id", field="id", model=ProductGender, null=True
    )
    modified = DateTimeField(null=True)
    modified_by = ForeignKeyField(
        column_name="modified_by", field="id", model=User, null=True,
    )
    name = CharField()
    size_range = ForeignKeyField(
        column_name="sizegroup_id", field="id", model=SizeRange, null=True
    )
    in_shop = IntegerField(
        column_name="stockincontainer", constraints=[SQL("DEFAULT 0")]
    )
    value = IntegerField(constraints=[SQL("DEFAULT 0")])

    class Meta:
        table_name = "products"
