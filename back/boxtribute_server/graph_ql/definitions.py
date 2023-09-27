"""Load and validate definitions of GraphQL files."""
from pathlib import Path

from ariadne import load_schema_from_path

MODULE_DIRECTORY = Path(__file__).resolve().parent
DEFINITIONS_DIRECTORY = MODULE_DIRECTORY / "definitions"

# Recursively load any .graphql files:
# - these are basic building blocks and shall be available to any schema
basic_definitions = load_schema_from_path(DEFINITIONS_DIRECTORY / "basic")
# - these are building blocks accessing protected data and must not be used in public
#   schemas
protected_definitions = load_schema_from_path(DEFINITIONS_DIRECTORY / "protected")

# Definitions for the schema consumed by the boxtribute v2 front-end
definitions = basic_definitions + protected_definitions

# Definitions for the schema consumed by the boxtribute query-only API
query_api_definitions = (
    "\n".join(
        load_schema_from_path(DEFINITIONS_DIRECTORY / "protected" / f"{name}.graphql")
        for name in ["types", "queries"]
    )
    + basic_definitions
)

# Definitions for the schema consumed by the public statistics API
public_api_definitions = (
    load_schema_from_path(DEFINITIONS_DIRECTORY / "public_api.graphql")
    + basic_definitions
)
