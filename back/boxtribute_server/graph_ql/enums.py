from ariadne import EnumType

from ..enums import (
    BoxState,
    HumanGender,
    Language,
    ProductGender,
    ShipmentState,
    TransferAgreementState,
    TransferAgreementType,
)

enum_types = [
    EnumType("ProductGender", ProductGender),
    EnumType("BoxState", BoxState),
    EnumType("HumanGender", HumanGender),
    EnumType("Language", Language),
    EnumType("ShipmentState", ShipmentState),
    EnumType("TransferAgreementState", TransferAgreementState),
    EnumType("TransferAgreementType", TransferAgreementType),
]
