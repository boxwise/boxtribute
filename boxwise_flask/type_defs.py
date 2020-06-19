"""GraphQL type definitions"""
from ariadne import gql

type_defs = gql(
    """
    type Query {
        hello: String!
        allBases: [Base]
        allUsers: [User]
        user(email: String): User
    }
    type Base {
        id: Int!
        name: String
        organisation_id: Int
    }
    type User{
        id: Int!
        organisation_id: Int
        name: String
        email: String!
        cms_usergroups_id: Int
        valid_firstday: String
        valid_lastday: String
        camp_id: [Int]
    }
"""
)
