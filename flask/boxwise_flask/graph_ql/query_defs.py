"""GraphQL query definitions"""
from ariadne import gql

query_defs = gql(
    """
    type Query {
        hello: String!
        bases: [Base!]!
        orgBases(orgId: Int): [Base]
        base(id: ID!): Base
        allUsers: [User]
        user(email: String): User
        box(boxId: String!): Box
        qrCode(qrCode: String!): QrCode
        qrExists(qrCode: String): Boolean
        location(id: ID!): Location
        locations: [Location!]!
        product(id: ID!): Product
        products: [Product!]!
    }
    """
)
