import { graphql } from "./graphql";

// Basic Fields without reference to other fragments first
export const ORGANISATION_BASIC_FIELDS_FRAGMENT = graphql(`
  fragment OrganisationBasicFields on Organisation @_unmask {
    id
    name
  }
`);

export const BASE_BASIC_FIELDS_FRAGMENT = graphql(`
  fragment BaseBasicFields on Base @_unmask {
    id
    name
  }
`);

export const USER_BASIC_FIELDS_FRAGMENT = graphql(`
  fragment UserBasicFields on User @_unmask {
    id
    name
  }
`);

export const PRODUCT_BASIC_FIELDS_FRAGMENT = graphql(`
  fragment ProductBasicFields on Product @_unmask {
    id
    name
    type
    gender
    deletedOn
    category {
      id
      name
    }
  }
`);

export const STANDARD_PRODUCT_BASIC_FIELDS_FRAGMENT = graphql(`
  fragment StandardProductBasicFields on StandardProduct @_unmask {
    id
    name
    gender
    category {
      id
      name
    }
    sizeRange {
      id
      label
    }
  }
`);

export const SIZE_BASIC_FIELDS_FRAGMENT = graphql(`
  fragment SizeBasicFields on Size @_unmask {
    id
    label
  }
`);

// fragments with references to Basic Fields
export const BASE_ORG_FIELDS_FRAGMENT = graphql(
  `
    fragment BaseOrgFields on Base @_unmask {
      ...BaseBasicFields
      organisation {
        ...OrganisationBasicFields
      }
    }
  `,
  [ORGANISATION_BASIC_FIELDS_FRAGMENT, BASE_BASIC_FIELDS_FRAGMENT],
);

export const SIZE_RANGE_FIELDS_FRAGMENT = graphql(
  `
    fragment SizeRangeFields on SizeRange @_unmask {
      id
      label
      sizes {
        ...SizeBasicFields
      }
    }
  `,
  [SIZE_BASIC_FIELDS_FRAGMENT],
);

export const BOX_BASIC_FIELDS_FRAGMENT = graphql(`
  fragment BoxBasicFields on Box @_unmask {
    labelIdentifier
    state
    comment
    location {
      id
      base {
        id
      }
    }
    shipmentDetail {
      id
      shipment {
        id
      }
    }
    lastModifiedOn
  }
`);

export const USER_FRAGMENT = graphql(`
  fragment UserFragment on User @_unmask {
    id
    name
    email
    lastLogin
    lastAction
    validFirstDay
    validLastDay
    organisation {
      id
      name
      bases {
        id
      }
    }
    bases {
      id
    }
  }
`);

export const PRODUCT_FRAGMENT = graphql(`
  fragment ProductFragment on ProductDimensionInfo @_unmask {
    id
    name
    gender
  }
`);

export const STOCK_OVERVIEW_FRAGMENT = graphql(`
  fragment StockOverviewFragment on StockOverviewResult @_unmask {
    __typename
    categoryId
    boxesCount
    productName
    gender
    sizeId
    dimensionId
    absoluteMeasureValue
    tagIds
    locationId
    boxState
    itemsCount
  }
`);

export const MOVED_BOXES_FRAGMENT = graphql(`
  fragment MoveBoxesFragment on MovedBoxesResult @_unmask {
    movedOn
    targetId
    categoryId
    boxesCount
    itemsCount
    gender
    productName
    tagIds
    organisationName
  }
`);

export const CREATED_BOXES_FRAGMENT = graphql(`
  fragment CreatedBoxesFragment on CreatedBoxesResult @_unmask {
    boxesCount
    productId
    categoryId
    createdOn
    tagIds
    gender
    itemsCount
  }
`);

export const BENEFICIARY_DEMOGRAPHICS_FRAGMENT = graphql(`
  fragment BeneficiaryDemographicsFragment on BeneficiaryDemographicsResult @_unmask {
    count
    createdOn
    age
    gender
    tagIds
  }
`);
