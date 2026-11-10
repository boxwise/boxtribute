from enum import Enum
from typing import List, Type, Union

from ariadne import EnumType

from ..enums import (
    BeneficiaryReachType,
    BoxSortField,
    BoxState,
    HumanGender,
    Language,
    ProductGender,
    ProductType,
    ProductTypeFilter,
    ShareableView,
    ShipmentDirection,
    ShipmentState,
    TaggableObjectType,
    TagType,
    TargetType,
    TransferAgreementState,
    TransferAgreementType,
)

enum_types: List[Union[EnumType, Type[Enum]]] = [
    ProductGender,
    BoxSortField,
    BoxState,
    HumanGender,
    Language,
    ShareableView,
    ShipmentDirection,
    ShipmentState,
    TagType,
    EnumType("TaggableResourceType", TaggableObjectType),
    TargetType,
    BeneficiaryReachType,
    TransferAgreementState,
    TransferAgreementType,
    ProductType,
    ProductTypeFilter,
]
