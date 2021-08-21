"""GraphQL query definitions"""
from ariadne import gql

query_defs = gql(
    """
    type Query {
        hello: String!
        allBases: [Base]
        orgBases(org_id: Int): [Base]
        base(id: Int!): Base
        allUsers: [User]
        user(email: String): User
        box(id: String): Box
        location(id: String): Location
        qrExists(qr_code: String): Boolean
        boxIdByQrCode(qr_code: String): Int
        product(product_id: Int): Product
        products: [Product]
    }
    """
)
