"""GraphQL type definitions"""
from ariadne import gql

type_defs = gql(
    """
    type Base {
        id: Int
        name: String
        currencyname: String
        organisation_id: Int
    }

    type User {
        id: Int!
        organisation_id: Int
        name: String
        email: String!
        cms_usergroups_id: Int
        valid_firstday: Date
        valid_lastday: Date
        camp_id: [Int]
        lastlogin: Datetime
        lastaction: Datetime
    }

    scalar Datetime
    scalar Date
    """
)
