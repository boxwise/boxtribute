"""Custom peewee field types for data model definitions."""
import enum

from peewee import CharField, DateTimeField, ForeignKeyField


class EnumCharField(CharField):
    """Custom class to store name OR value of Python enum item (enum class passed as the
    `choices` argument during initialization) in a `varchar` field.
    Two methods are provided to convert between application and database layer.
    The conversion is defined by the `choices` attribute.
    Cf. suggestions in https://github.com/coleifer/peewee/issues/630

    Note that this class does not represent the MySQL ENUM type.

    If the GraphQL enum values are not identical to the values used on database level
    (the Python enum class derives from `enum.Enum`), a mapping is performed, e.g.
        -  GraphQL TagType.Box
        -> Python  TagType.Box
        -> MySQL   "Stock"
    Otherwise (for `IntEnum` classes) the enum value is irrelevant.
    """

    def __init__(self, *args, **kwargs):
        self.enum_class = kwargs.pop("choices")
        self.is_int_enum_class = issubclass(self.enum_class, enum.IntEnum)
        super().__init__(*args, **kwargs)

    def db_value(self, value):
        """Convert from application to database layer. Accept Python enum member as
        value, and return the corresponding enum member name OR value. This way, two
        scenarios are supported:
        1. storing the value of a GraphQL Enum input field
        2. assigning a Python enum member to a peewee model field
        """
        return value.name if self.is_int_enum_class else value.value

    def python_value(self, name):
        """Convert from database to application layer. Return Python enum member (which
        in the GraphQL layer is converted to an Enum field).
        """
        return (
            getattr(self.enum_class, name)  # e.g. "Lost" -> BoxState.Lost
            if self.is_int_enum_class
            else self.enum_class(name)  # e.g. "Stock" -> TagType.Box
        )


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


class ZeroDateTimeField(DateTimeField):
    """Custom class to convert MySQL zero DATETIME field value into None."""

    def adapt(self, value):
        if value == "0000-00-00 00:00:00":
            return
        return super().adapt(value)
