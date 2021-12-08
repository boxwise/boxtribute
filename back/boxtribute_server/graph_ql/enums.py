from ariadne import EnumType

from ..models.enums import BoxState, HumanGender, Language, ProductGender

enum_types = [
    EnumType("ProductGender", ProductGender),
    EnumType("BoxState", BoxState),
    EnumType("HumanGender", HumanGender),
    EnumType("Language", Language),
]
