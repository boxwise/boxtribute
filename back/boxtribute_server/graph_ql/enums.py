from enum import Enum
from typing import List, Type, Union

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
    ProductType,
    ProductTypeFilter,
    ShareableView,
    ShipmentState,
    TaggableObjectType,
    TagType,
    TargetType,
    TransferAgreementState,
    TransferAgreementType,
)

enum_types: List[Union[EnumType, Type[Enum]]] = [
    ProductGender,
    BoxState,
    HumanGender,
    Language,
    PackingListEntryState,
    ShareableView,
    ShipmentState,
    TagType,
    EnumType("TaggableResourceType", TaggableObjectType),
    TargetType,
    TransferAgreementState,
    TransferAgreementType,
    ProductType,
    ProductTypeFilter,
    DistributionEventState,
    DistributionEventsTrackingGroupState,
    DistributionEventTrackingFlowDirection,
]
