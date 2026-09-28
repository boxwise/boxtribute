from peewee import CharField, DateTimeField, DeferredForeignKey

from . import Model


# We have to defer the initialization of the foreign keys with the Organisation and User
# model because of the cyclic dependency (Organisation is created by User, User belongs
# to Usergroup, Usergroup belongs to Organisation)
class Usergroup(Model):
    created_on = DateTimeField(null=True, column_name="created")
    created_by = DeferredForeignKey(
        "User",
        column_name="created_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    deleted_on = DateTimeField(null=True, column_name="deleted", default=None)
    last_modified_on = DateTimeField(null=True, column_name="modified")
    last_modified_by = DeferredForeignKey(
        "User",
        column_name="modified_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    name = CharField(column_name="label")
    organisation = DeferredForeignKey("Organisation", on_update="CASCADE")

    class Meta:
        table_name = "cms_usergroups"
