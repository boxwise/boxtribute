"""GraphQL type definitions"""
from ariadne import gql

type_defs = gql(
    """
    enum ProductGender{
        Men
        Women
        UnisexAdult
        UnisexChild
        UnisexBaby
        TeenGirl
        TeenBoy
        Girl
        Boy
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
        box_id: String!
        product_id: Int
        size_id: Int
        items: Int
        location_id: Int
        comments: String
        qr_id: Int
        created: Datetime
        created_by: String
        box_state_id: Int
        product: Product
        location: Location
    }

    type Product {
        id: Int!
        name: String!
        sizes: [String!]!
        price: Float
        createdBy: String!
        createdOn: Datetime!
        lastModifiedBy: String!
        lastModifiedOn: Datetime!
        gender: ProductGender!
    }

    type Location {
        id: Int!
        name: String!
    }

    input CreateBoxInput {
        box_id: String #this is an output, but not an input
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
