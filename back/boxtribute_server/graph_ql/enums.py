from ariadne import EnumType

from ..models.enums import BoxState, Language, ProductGender

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

language_enum = EnumType("Language", Language)
