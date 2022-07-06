from ariadne import EnumType

from ..enums import (
    BoxState,
    DistributionEventState,
    HumanGender,
    Language,
    PackingListEntryState,
    ProductGender,
    ShipmentState,
    TagType,
    TransferAgreementState,
    TransferAgreementType,
)

enum_types = [
    EnumType("ProductGender", ProductGender),
    EnumType("BoxState", BoxState),
    EnumType("HumanGender", HumanGender),
    EnumType("Language", Language),
    EnumType("PackingListEntryState", PackingListEntryState),
    EnumType("ShipmentState", ShipmentState),
    EnumType("TagType", TagType),
    EnumType("TransferAgreementState", TransferAgreementState),
    EnumType("TransferAgreementType", TransferAgreementType),
    EnumType("DistributionEventState", DistributionEventState),
]
