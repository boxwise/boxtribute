"""Load and validate definitions of GraphQL files."""
from pathlib import Path

from ariadne import load_schema_from_path

MODULE_DIRECTORY = Path(__file__).resolve().parent

# Recursively load any .graphql files
definitions = load_schema_from_path(MODULE_DIRECTORY)

query_api_definitions = "\n".join(
    load_schema_from_path(MODULE_DIRECTORY / f"{name}.graphql")
    for name in ["types", "queries"]
)
