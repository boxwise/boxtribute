"""GraphQL type definitions"""
from ariadne import gql

type_defs = gql(
    """
    type Box{
        ID: ID!
        boxLabelIdentifier: String!
        location: Location!
        items: Int!
        product: Product!
        gender: ProductGender
        # A size from a size range, consider making this enum
        size: String!
        state: BoxState!
        qrCode: QRCode!
        createdBy: String!
        createdOn: Datetime!
        # The user who last changed something about the box
        lastModifiedBy: String!
        lastModifiedOn: Datetime!
        comment: String
    }

    type QRCode{
        ID: ID!
        code: String!
        box: Box
        createdOn: Datetime
        # The user who generated QR code
        createdBy: String!
    }

    type Product{
        ID: ID!
        name: String!
        category: ProductCategory!
        sizeRange: SizeRange!
        sizes: [String!]!
        base: Base!
        price: Float
        gender: ProductGender
        createdBy: String!
        createdOn: Datetime!
        # The user who last changed something about the box
        lastModifiedBy: String!
        lastModifiedOn: Datetime!
    }

    type ProductCategory{
        ID: ID!
        categoryName: String!
        products: [Product]
        sizeRanges: [SizeRange]
        hasGender: Boolean!
    }

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

    enum BoxState{
        InStock
        Lost
        Ordered
        Picked
        Donated
        Scrap
    }

    type SizeRange{
        ID: ID!
        label: String!
        sizes: [String!]!
        productCategory: [ProductCategory!]
    }

    type Location{
        ID: ID!
        base: Base!
        name: String
        isShop: Boolean!
        isDeleted: Boolean!
        # List of all the boxes in the location
        boxes: [Box!]
        hasBoxState: BoxState
        createdOn: Datetime!
        # The user who generated QR code
        createdBy: String!
        lastModifiedBy: String!
        lastModifiedOn: Datetime!
    }

    type Base{
        ID: ID!
        name: String!
        parentOrg: Organisation!
        locations: [Location!]
        currencyName: String
    }

    type Organisation{
        ID: ID!
        name: String!
        bases: [Base!]
    }

    type Order{
        ID: ID!
        fromLocation: String!
        toLocation: String!
        # If null means internal transfer
        fromOrg: Int
        # If null means internal transfer
        toOrg: Int
        boxes: Box!
        # If box state of all ordered boxes have not yet been changed, then it is active
        isActive: Boolean!
        createdBy: String!
        createdOn: Datetime!
        lastModifiedBy: String
        # Need to change int to custom scalar for datetime
        lastModifiedOn: Int
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

    input CreateBoxInput {
        box_id: String #this is an output, but not an input
        product_id: Int! #this is a foreign key
        size_id: Int #this is a foreign key
        items: Int
        location_id: Int! #this is a foreign key
        comment: String!
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
