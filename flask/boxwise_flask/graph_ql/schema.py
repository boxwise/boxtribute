from ariadne import gql, make_executable_schema, snake_case_fallback_resolvers

from .enums import box_state_enum, gender_enum, language_enum, product_gender_enum
from .mutation_defs import mutation_defs
from .query_defs import query_defs
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
from .type_defs import type_defs

schema = make_executable_schema(
    gql(type_defs + query_defs + mutation_defs),
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
