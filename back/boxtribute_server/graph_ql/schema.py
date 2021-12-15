from ariadne import make_executable_schema, snake_case_fallback_resolvers

from .definitions import definitions
from .enums import enum_types
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
    transfer_agreement,
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
        transfer_agreement,
        user,
        *enum_types,
    ],
    snake_case_fallback_resolvers,
)
