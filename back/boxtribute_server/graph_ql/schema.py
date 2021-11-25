from ariadne import make_executable_schema, snake_case_fallback_resolvers

from .definitions import definitions
from .enums import box_state_enum, gender_enum, language_enum, product_gender_enum
from .resolvers import (
    base,
    beneficiary,
    box,
    location,
    mutation,
    organisation,
    product,
    product_category,
    qr_code,
    query,
    user,
)
from .scalars import date_scalar, datetime_scalar

schema = make_executable_schema(
    definitions,
    [
        query,
        mutation,
        date_scalar,
        datetime_scalar,
        base,
        beneficiary,
        box,
        location,
        organisation,
        product,
        product_category,
        qr_code,
        user,
        box_state_enum,
        gender_enum,
        language_enum,
        product_gender_enum,
    ],
    snake_case_fallback_resolvers,
)
