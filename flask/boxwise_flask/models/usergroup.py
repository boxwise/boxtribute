from boxwise_flask.db import db
from boxwise_flask.models.organisation import Organisation
from boxwise_flask.models.usergroup_access_level import UsergroupAccessLevel
from peewee import SQL, CharField, DateTimeField, DeferredForeignKey, ForeignKeyField


class Usergroup(db.Model):
    created = DateTimeField(null=True)
    created_by = DeferredForeignKey(
        "User",
        column_name="created_by",
        null=True,
        default=None,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    deleted = DateTimeField(null=True, default=None)
    label = CharField(null=True)
    modified = DateTimeField(null=True)
    modified_by = DeferredForeignKey(
        "User",
        column_name="modified_by",
        null=True,
        default=None,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    organisation = ForeignKeyField(
        column_name="organisation_id",
        field="id",
        model=Organisation,
        on_update="CASCADE",
    )
    usergroup_access_level = ForeignKeyField(
        column_name="userlevel",
        field="id",
        model=UsergroupAccessLevel,
        on_update="CASCADE",
    )

    class Meta:
        table_name = "cms_usergroups"

    def __str__(self):
        return self.id
