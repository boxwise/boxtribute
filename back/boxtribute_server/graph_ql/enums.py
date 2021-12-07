from ariadne import EnumType

from ..models.enums import BoxState, ProductGender

# Translate GraphQL enum into id field of database table
product_gender_enum = EnumType("ProductGender", ProductGender)


box_state_enum = EnumType("BoxState", BoxState)


gender_enum = EnumType(
    "HumanGender",
    {
        "Male": "M",
        "Female": "F",
        "Diverse": "D",
    },
)

language_enum = EnumType(
    "Language",
    {
        "nl": 1,
        "en": 2,
        "fr": 3,
        "de": 4,
        "ar": 5,
        "ckb": 6,
    },
)
