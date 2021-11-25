from ariadne import EnumType

# Translate GraphQL enum into id field of database table
product_gender_enum = EnumType(
    "ProductGender",
    {
        "Women": 1,
        "UnisexAdult": 3,
    },
)

box_state_enum = EnumType(
    "BoxState",
    {
        "InStock": 1,
    },
)

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
