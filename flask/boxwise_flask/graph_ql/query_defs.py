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
        qrExists(qr_code: String): Boolean
        qrBoxExists(qr_code: String): Boolean
        getBoxDetails(box_id: Int, qr_code: String): Box
        getBoxesByLocation(location_id: Int!): [Box]
    }
    """
)
