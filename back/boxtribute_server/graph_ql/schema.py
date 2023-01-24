from ariadne import make_executable_schema, snake_case_fallback_resolvers

from .bindables import (
    interface_types,
    mutation_types,
    object_types,
    query_types,
    union_types,
)
from .definitions import definitions, query_api_definitions
from .enums import enum_types
from .scalars import date_scalar, datetime_scalar

full_api_schema = make_executable_schema(
    definitions,
    [
        date_scalar,
        datetime_scalar,
        *query_types,
        *mutation_types,
        *object_types,
        *enum_types,
        *union_types,
        *interface_types,
    ],
    snake_case_fallback_resolvers,
)

query_api_schema = make_executable_schema(
    query_api_definitions,
    [
        date_scalar,
        datetime_scalar,
        *query_types,
        *object_types,
        *enum_types,
        *union_types,
        *interface_types,
    ],
    snake_case_fallback_resolvers,
)
