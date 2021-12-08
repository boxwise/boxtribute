"""Custom peewee field types for data model definitions."""
from peewee import CharField, DeferredForeignKey, ForeignKeyField


class EnumCharField(CharField):
    """Custom class to store name of Python enum item (enum class passed as the
    `choices` argument during initialization) in a `varchar` field.
    Internally it converts between an integer in the application layer, and a string in
    the database layer. The conversion is defined by the `choices` attribute.
    Cf. suggestions in https://github.com/coleifer/peewee/issues/630

    Note that this class does not represent the MySQL ENUM type.
    """

    def __init__(self, *args, **kwargs):
        self.enum_class = kwargs.pop("choices")
        super().__init__(*args, **kwargs)

    def db_value(self, value):
        return self.enum_class(value).name

    def python_value(self, name):
        return getattr(self.enum_class, name).value


class UIntForeignKeyField(ForeignKeyField):
    """Work-around field type, since using constraints results in a syntax error.
    Always use this class to reference another model (note that database primary keys
    are unsigned integers).
    Cf. https://github.com/coleifer/peewee/issues/1594#issuecomment-386003608

    Details:
    1. `ForeignKeyField(null=True, constraints=[SQL("UNSIGNED")])` or
       `UIntForeignKeyField(null=True) yield the valid SQL
        ... INTEGER UNSIGNED
    2. `ForeignKeyField(constraints=[SQL("UNSIGNED")])` yields the invalid SQL
        ... INTEGER NOT NULL UNSIGNED
    3. `UIntForeignKeyField()` yields the valid SQL
        ... INTEGER UNSIGNED NOT NULL
    """

    field_type = "INTEGER UNSIGNED"


class UIntDeferredForeignKey(DeferredForeignKey):
    """Work-around field type, since using constraints results in a syntax error.
    Cf. `UIntForeignKeyField`.
    """

    field_type = "INTEGER UNSIGNED"
