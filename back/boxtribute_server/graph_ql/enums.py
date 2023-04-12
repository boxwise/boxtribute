from ariadne import EnumType

from ..enums import (
    BoxState,
    DistributionEventState,
    DistributionEventsTrackingGroupState,
    DistributionEventTrackingFlowDirection,
    HumanGender,
    Language,
    PackingListEntryState,
    ProductGender,
    ShipmentState,
    TaggableObjectType,
    TagType,
    TransferAgreementState,
    TransferAgreementType,
)

enum_types = [
    ProductGender,
    BoxState,
    HumanGender,
    Language,
    PackingListEntryState,
    ShipmentState,
    TagType,
    EnumType("TaggableResourceType", TaggableObjectType),
    TransferAgreementState,
    TransferAgreementType,
    DistributionEventState,
    DistributionEventsTrackingGroupState,
    DistributionEventTrackingFlowDirection,
    DistributionEventTrackingFlowDirection,
]
