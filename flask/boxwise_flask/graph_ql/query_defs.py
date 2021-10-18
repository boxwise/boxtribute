"""GraphQL query definitions"""
from ariadne import gql

query_defs = gql(
    """
    type Query {
        hello: String!
        bases: [Base!]!
        base(id: ID!): Base
        organisation(id: ID!): Organisation
        organisations: [Organisation!]!
        user(id: ID): User
        users: [User!]!
        box(boxLabelIdentifier: String!): Box
        qrCode(qrCode: String!): QrCode
        qrExists(qrCode: String): Boolean
        location(id: ID!): Location
        locations: [Location!]!
        product(id: ID!): Product
        products: [Product!]!
        productCategory(id: ID!): ProductCategory
        productCategories: [ProductCategory!]!
        beneficiary(id: ID!): Beneficiary
        beneficiaries: [Beneficiary!]!
    }
    """
)
