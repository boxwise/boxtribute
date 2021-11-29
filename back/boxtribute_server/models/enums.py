"""Enumeration types used in the database."""
import enum


class TransferAgreementState(enum.IntEnum):
    UNDER_REVIEW = 0
    ACCEPTED = enum.auto()
    REJECTED = enum.auto()
    CANCELED = enum.auto()
    EXPIRED = enum.auto()


class TransferAgreementType(enum.IntEnum):
    UNIDIRECTIONAL = 0
    BIDIRECTIONAL = enum.auto()
