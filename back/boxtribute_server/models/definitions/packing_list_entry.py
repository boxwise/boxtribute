from peewee import DateTimeField, IntegerField

from ...db import db
from ...enums import PackingListEntryState
from ..fields import EnumCharField, UIntForeignKeyField
from .packing_list import PackingList
from .product import Product
from .size import Size
from .user import User


class PackingListEntry(db.Model):
    product = UIntForeignKeyField(
        column_name="product_id",
        field="id",
        model=Product,
        on_update="CASCADE",
    )
    number_of_items = IntegerField()
    size = UIntForeignKeyField(
        column_name="size_id",
        field="id",
        model=Size,
        on_update="CASCADE",
    )
    packing_list = UIntForeignKeyField(
        column_name="packing_list_id",
        field="id",
        model=PackingList,
        on_update="CASCADE",
    )
    state = EnumCharField(choices=PackingListEntryState)
    # TODO: also add matchingPackedItemsCollections: [ItemsCollection!]!
    created_on = DateTimeField(column_name="created", null=True)
    created_by = UIntForeignKeyField(
        model=User,
        column_name="created_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    last_modified_on = DateTimeField(column_name="modified", null=True)
    last_modified_by = UIntForeignKeyField(
        model=User,
        column_name="modified_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )

    class Meta:
        table_name = "packing_list_entry"
