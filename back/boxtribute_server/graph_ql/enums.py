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
    TargetType,
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
    TargetType,
    TransferAgreementState,
    TransferAgreementType,
    DistributionEventState,
    DistributionEventsTrackingGroupState,
    DistributionEventTrackingFlowDirection,
    DistributionEventTrackingFlowDirection,
]
