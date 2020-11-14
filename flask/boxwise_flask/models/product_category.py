from peewee import SQL, CharField, ForeignKeyField, IntegerField

from boxwise_flask.db import db


class ProductCategory(db.Model):
    label = CharField(null=True)
    parent = ForeignKeyField(
        column_name="parent_id", field="id", model="self", null=True
    )
    seq = IntegerField(constraints=[SQL("DEFAULT 0")])

    class Meta:
        table_name = "product_categories"
