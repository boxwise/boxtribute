"""GraphQL mutation definitions"""
from ariadne import gql

mutation_defs = gql(
    """
    type Mutation {
        createBox(box_creation_input:CreateBoxInput):Box
    }
    """
)
