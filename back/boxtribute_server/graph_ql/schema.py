from ariadne import make_executable_schema

from ..business_logic.statistics.queries import query as statistics_query
from .bindables import (
    interface_types,
    mutation_types,
    object_types,
    query_types,
    union_types,
)
from .definitions import definitions, public_api_definitions, query_api_definitions
from .enums import HumanGender, enum_types
from .scalars import date_scalar, datetime_scalar

full_api_schema = make_executable_schema(
    definitions,
    date_scalar,
    datetime_scalar,
    *query_types,
    *mutation_types,
    *object_types,
    *enum_types,
    *union_types,
    *interface_types,
    convert_names_case=True,
)

query_api_schema = make_executable_schema(
    query_api_definitions,
    date_scalar,
    datetime_scalar,
    *query_types,
    *object_types,
    *enum_types,
    *union_types,
    *interface_types,
    convert_names_case=True,
)

# Schema for public API without
# - most query types
# - object types
# - union/interface types
public_api_schema = make_executable_schema(
    public_api_definitions,
    date_scalar,
    statistics_query,
    HumanGender,
    convert_names_case=True,
)
