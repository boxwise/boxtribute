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

# public_api_definitions = load_schema_from_path(
#     MODULE_DIRECTORY / "public_queries.graphql"
# )
public_api_definitions = """
type Query {
  beneficiaryDemographics(baseIds: [Int!]): [BeneficiaryDemographicsResult]
}

type BeneficiaryDemographicsResult {
  age: Int
  gender: HumanGender
  createdOn: Date
  count: Int
}

enum HumanGender {
  Male
  Female
  Diverse
}

scalar Date
"""
