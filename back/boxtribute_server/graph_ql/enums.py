from enum import Enum
from typing import List, Type, Union

from ariadne import EnumType

from ..enums import (
    BeneficiaryReachType,
    BeneficiarySortField,
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
    BeneficiarySortField,
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
