from boxwise_flask.db import db
from peewee import SQL, CharField, ForeignKeyField, IntegerField


class ProductCategory(db.Model):
    name = CharField(column_name="label", null=True)
    parent = ForeignKeyField(
        column_name="parent_id", field="id", model="self", null=True
    )
    seq = IntegerField(constraints=[SQL("DEFAULT 0")])

    class Meta:
        table_name = "product_categories"
