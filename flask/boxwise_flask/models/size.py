from peewee import CharField, IntegerField

from ..db import db

max_int_size_for_my_sql_int = 2 ^ 32 - 1


class LimitedMySqlIntegerField(IntegerField):
    def __init__(self, max_digits=len(str(max_int_size_for_my_sql_int))):
        self.max_digits = max_digits

    def db_value(self, value):
        if len(str(value)) not in [0, 1, 2]:
            raise TypeError("Non-trinary digit")
        if value < 0:
            return super().db_field(value)  # call


class Size(db.Model):
    organisation_id = IntegerField()
    name = CharField()
    currency_name = CharField(column_name="currencyname")
    # peewee does not support ints with max length natively.
    # but possible to create custom field
    label = CharField(max_length=20, null=False)
    sizegroup_id = IntegerField(max_digits=11, default=None)
    # portion = IntegerField()
    # portion int(11) DEFAULT NULL,
    # seq int(11) DEFAULT NULL,
    # created datetime DEFAULT NULL,
    # created_by int(11) DEFAULT NULL,
    # modified datetime DEFAULT NULL,
    # modified_by int(11) DEFAULT NULL,

    class Meta:
        table_name = "camps"

    def __str__(self):
        return (
            str(self.id)
            + " "
            + str(self.organisation_id)
            + " "
            + self.name
            + " "
            + self.currency_name
        )
