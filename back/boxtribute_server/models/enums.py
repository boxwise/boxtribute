"""Enumeration types used in the database."""
import enum

from peewee import CharField


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


class TransferAgreementState(enum.IntEnum):
    UNDER_REVIEW = 1
    ACCEPTED = enum.auto()
    REJECTED = enum.auto()
    CANCELED = enum.auto()
    EXPIRED = enum.auto()


class TransferAgreementType(enum.IntEnum):
    UNIDIRECTIONAL = 1
    BIDIRECTIONAL = enum.auto()


class ShipmentState(enum.IntEnum):
    PREPARING = 1
    SENT = enum.auto()
    RECEIVED = enum.auto()
    CANCELED = enum.auto()
    LOST = enum.auto()
