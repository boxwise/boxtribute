from ariadne import EnumType

# Translate GraphQL enum into id field of database table
product_gender_enum = EnumType(
    "ProductGender",
    {
        "Women": 1,
        "Men": 2,
        "UnisexAdult": 3,
        "Girl": 4,
        "Boy": 5,
        "UnisexKid": 6,
        "UnisexBaby": 9,
        "None": 10,
        "TeenGirl": 12,
        "TeenBoy": 13,
    },
)

box_state_enum = EnumType(
    "BoxState",
    {
        "InStock": 1,
        "Lost": 2,
        "Ordered": 3,
        "Picked": 4,
        "Donated": 5,
        "Scrap": 6,
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
