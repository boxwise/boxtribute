from ariadne import EnumType

from ..models.enums import BoxState, HumanGender, Language, ProductGender

# Translate GraphQL enum into id field of database table
product_gender_enum = EnumType("ProductGender", ProductGender)


box_state_enum = EnumType("BoxState", BoxState)


gender_enum = EnumType("HumanGender", HumanGender)

language_enum = EnumType("Language", Language)
