"""GraphQL query definitions"""
from ariadne import gql

query_defs = gql(
    """
    type Query {
        hello: String!
        allBases: [Base]
        orgBases(orgId: Int): [Base]
        base(id: Int!): Base
        allUsers: [User]
        user(email: String): User
        qrExists(qrCode: String): Boolean
        qrBoxExists(qrCode: String): Boolean
        getBoxDetails(boxId: Int, qrCode: String): Box
        getBoxesByLocation(locationId: Int!): [Box]
    }
    """
)
