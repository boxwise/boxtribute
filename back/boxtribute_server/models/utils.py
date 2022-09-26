"""Utility functions to support data model definitions."""
from datetime import datetime, timezone
from functools import wraps

from flask import g, request
from peewee import ForeignKeyField, IntegerField

from ..db import db
from .definitions.history import DbChangeHistory


def utcnow():
    """Return current datetime in UTC, in second precision (the MySQL database is
    configured to not store any fractional seconds).
    """
    return datetime.now(tz=timezone.utc).replace(microsecond=0)


def save_update_to_history(*, model, id_field_name="id", field_names):
    """Utility for writing information about modifying a resource to the history table,
    intended to decorate a function that modifies a database resource (e.g. a box).

    The type of the modified resource is indicated by `model`, the relevant field names
    by `field_names`. `id_field_name` refers to the field name used to identify the
    model instance that is being modified. In the signature of the decorated function an
    argument with identical name must exist. The decorated function must return the
    modified resource.

    The function fetches the resource (i.e. the old database row) first, and then runs
    the decorated function, effectively executing the modification. For each of the
    fields that were actually modified an entry in the history table is created.
    """

    def decorator(f):
        @wraps(f)
        def inner(*args, **kwargs):
            # e.g. Box.label_identifier
            id_field = getattr(model, id_field_name)
            # e.g. Box.get(Box.label_identifier == "123456")
            old_resource = model.get(id_field == kwargs[id_field_name])
            new_resource = f(*args, **kwargs)

            now = utcnow()
            entries = []
            for field_name in field_names:
                old_value = getattr(old_resource, field_name)
                new_value = getattr(new_resource, field_name)

                if old_value == new_value:
                    continue  # no change in value, hence no need for history entry

                entry = DbChangeHistory()
                entry.table_name = model._meta.table_name
                entry.record_id = new_resource.id
                entry.user = g.user.id
                entry.ip = request.remote_addr
                entry.change_date = now

                field = getattr(model, field_name)
                if issubclass(field.__class__, (IntegerField, ForeignKeyField)):
                    entry.from_int = old_value
                    entry.to_int = new_value
                    entry.changes = field.column_name
                else:
                    entry.changes = f"""{field.column_name} changed from "{old_value}" \
to "{new_value}"."""
                entries.append(entry)

            with db.database.atomic():
                DbChangeHistory.bulk_create(entries)

            return new_resource

        return inner

    return decorator
