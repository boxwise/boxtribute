"""Enumeration types used in the application."""
import enum


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


class BoxState(enum.IntEnum):
    """Representation of values of the `BoxState` data model."""

    InStock = 1
    Lost = enum.auto()
    Ordered = enum.auto()
    Picked = enum.auto()
    Donated = enum.auto()
    Scrap = enum.auto()


class ProductGender(enum.IntEnum):
    """Representation of values of the `ProductGender` data model."""

    Women = 1
    Men = enum.auto()
    UnisexAdult = enum.auto()
    Girl = enum.auto()
    Boy = enum.auto()
    UnisexKid = enum.auto()
    UnisexBaby = 9
    none = enum.auto()
    TeenGirl = 12
    TeenBoy = enum.auto()


class Language(enum.IntEnum):
    """Representation of values of the `Language` data model."""

    nl = 1
    en = enum.auto()
    fr = enum.auto()
    de = enum.auto()
    ar = enum.auto()
    ckb = enum.auto()


class HumanGender(enum.Enum):
    Male = "M"
    Female = "F"
    Diverse = "D"
