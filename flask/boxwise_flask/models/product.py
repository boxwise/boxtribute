from boxwise_flask.db import db
from boxwise_flask.models.base import Base
from boxwise_flask.models.product_category import ProductCategory
from boxwise_flask.models.product_gender import ProductGender
from boxwise_flask.models.size_range import SizeRange
from boxwise_flask.models.size import Size
from boxwise_flask.models.user import User
from peewee import SQL, CharField, DateTimeField, ForeignKeyField, IntegerField


class Product(db.Model):
    base = ForeignKeyField(
        column_name="camp_id",
        field="id",
        model=Base,
        null=True,
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    product_category = ForeignKeyField(
        column_name="category_id",
        field="id",
        model=ProductCategory,
        null=True,
        constraints=[SQL("UNSIGNED")],
    )
    comments = CharField(null=True)
    created = DateTimeField(null=True)
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
    product_gender = ForeignKeyField(
        column_name="gender_id",
        field="id",
        model=ProductGender,
        on_update="CASCADE",
    )
    modified = DateTimeField(null=True)
    modified_by = ForeignKeyField(
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
    value = IntegerField(constraints=[SQL("DEFAULT 0")])
    price = value

    # sizes = size_range

    class Meta:
        table_name = "products"

    # def sizes(__self__):
    #     return 3
    #     # Size.select.where(Size.seq == __self__.size_range.seq)

    @staticmethod
    def get_product(product_id):
        return Product.get(Product.id == product_id)

    @staticmethod
    def get_all():
        return Product.select()
