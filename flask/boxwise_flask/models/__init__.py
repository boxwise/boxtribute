from peewee import IntegerField


class UnsignedIntegerField(IntegerField):
    """Custom type for primary keys fields.
    The tables of our underlying MySQL database have unsigned integer primary
    keys. Omitting a primary key field attribute in the model definitions makes
    peewee define them as AutoField which translates to signed integer primary
    keys. Defining `IntegerField(primary_key=True, constraints=[SQL("UNSIGNED")])`
    yields invalid MySQL syntax (see peewee issue #1594).
    """

    field_type = "INTEGER UNSIGNED"
