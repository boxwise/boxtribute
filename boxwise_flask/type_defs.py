"""GraphQL type definitions"""
from ariadne import gql

type_defs = gql(
    """
    type Query {
        hello: String!
        allCamps: [Camp]
    }
    type Camp {
        id: Int!
        name: String
        organisation_id: Int
    }
"""
)
