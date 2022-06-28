"""Enumeration types used in the application."""
import enum


class TransferAgreementState(enum.IntEnum):
    UnderReview = 1
    Accepted = enum.auto()
    Rejected = enum.auto()
    Canceled = enum.auto()
    Expired = enum.auto()


class DistributionEventState(enum.IntEnum):
    New = 1
    Planning = enum.auto()
    PlanningDone = enum.auto()
    Packing = enum.auto()
    PackingDone = enum.auto()
    OnDistro = enum.auto()
    Returned = enum.auto()
    ReturnsTracked = enum.auto()
    Completed = enum.auto()


class TransferAgreementType(enum.IntEnum):
    Unidirectional = 1
    Bidirectional = enum.auto()


class ShipmentState(enum.IntEnum):
    Preparing = 1
    Sent = enum.auto()
    Completed = enum.auto()
    Canceled = enum.auto()
    Lost = enum.auto()


class BoxState(enum.IntEnum):
    """Representation of values of the `BoxState` data model."""

    InStock = 1
    Lost = enum.auto()
    MarkedForShipment = enum.auto()
    Received = enum.auto()
    Donated = enum.auto()
    Scrap = enum.auto()


class LocationType(enum.IntEnum):
    """Indiciates which concrete type (classic Location, Distribution Spot, etc)
    a Location is."""

    Location = 1
    DistributionSpot = enum.auto()


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


class TagType(enum.Enum):
    Box = "Stock"
    Beneficiary = "People"
    All = "All"


class TaggableObjectType(enum.Enum):
    Box = "Stock"
    Beneficiary = "People"
