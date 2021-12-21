"""Custom peewee field types for data model definitions."""
from peewee import CharField, ForeignKeyField


class EnumCharField(CharField):
    """Custom class to store name of Python enum item (enum class passed as the
    `choices` argument during initialization) in a `varchar` field.
    Two methods are provided to convert between application and database layer.
    The conversion is defined by the `choices` attribute.
    Cf. suggestions in https://github.com/coleifer/peewee/issues/630

    Note that this class does not represent the MySQL ENUM type.
    """

    def __init__(self, *args, **kwargs):
        self.enum_class = kwargs.pop("choices")
        super().__init__(*args, **kwargs)

    def db_value(self, value):
        """Convert from application to database layer. Accept Python enum member as
        value, and return the corresponding enum member name. This way, two scenarios
        are supported:
        1. storing the value of a GraphQL Enum input field
        2. assigning a Python enum member to a peewee model field
        """
        return value.name

    def python_value(self, name):
        """Convert from database to application layer. Return Python enum member (which
        in the GraphQL layer is converted to an Enum field).
        """
        return getattr(self.enum_class, name)


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
