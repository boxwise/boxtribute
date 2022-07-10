from ariadne import make_executable_schema, snake_case_fallback_resolvers

from .definitions import definitions, query_api_definitions
from .enums import enum_types
from .resolvers import interface_types, mutation, object_types, query, union_types
from .scalars import date_scalar, datetime_scalar

full_api_schema = make_executable_schema(
    definitions,
    [
        query,
        mutation,
        date_scalar,
        datetime_scalar,
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
        query,
        date_scalar,
        datetime_scalar,
        *object_types,
        *enum_types,
        *union_types,
        *interface_types,
    ],
    snake_case_fallback_resolvers,
)
