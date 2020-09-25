"""GraphQL type definitions"""
from ariadne import gql

type_defs = gql(
    """
    type Query {
        hello: String!
        allBases: [Base]
        orgBases(org_id: Int): [Base]
        base(id: String!): Base
        allUsers: [User]
        user(email: String): User
    }

    type Mutation {
        createBox(box_creation_input:CreateBoxInput):Box
    }

    type Base {
        id: Int
        name: String
        currencyName: String
        organisationId: Int
    }

    type User {
        id: Int!
        organisation_id: Int
        name: String
        email: String!
        usergroup_id: Int
        valid_firstday: Date
        valid_lastday: Date
        base_id: [Int]
        lastlogin: Datetime
        lastaction: Datetime
    }

    type Box {
        id: Int
        box_id: Int!
        product_id: Int
        size_id: Int
        items: Int
        location_id: Int
        comments: String
        qr_id: String
        created: Datetime
        created_by: String
        box_state_id: Int
    }

    input CreateBoxInput {
        box_id: Int #this is an output, but not an input
        product_id: Int! #this is a foreign key
        size_id: Int #this is a foreign key
        items: Int
        location_id: Int! #this is a foreign key
        comments: String!
        #this will get looked up to turn into qr_id, which is a foreign key
        qr_barcode: String!
        created: Datetime #this is an output, but not an input
        created_by: String #this is null in the table consistently
        box_state_id: Int  #this is an output, but not an input
    }

    scalar Datetime
    scalar Date
"""
)
