"""GraphQL query definitions"""
from ariadne import gql

query_defs = gql(
    """
    type Query {
        hello: String!
        allBases: [Base]
        orgBases(org_id: Int): [Base]
        base(id: String!): Base
        allUsers: [User]
        user(email: String): User
    }
    """
)
