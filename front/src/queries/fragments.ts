import { BASE_BASIC_FIELDS_FRAGMENT, ORGANISATION_BASIC_FIELDS_FRAGMENT, PRODUCT_BASIC_FIELDS_FRAGMENT, SIZE_BASIC_FIELDS_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT, USER_BASIC_FIELDS_FRAGMENT } from "../../../graphql/fragments";
import { graphql } from "../../../graphql/graphql"

export const LOCATION_BASIC_FIELDS_FRAGMENT = graphql(`
  fragment LocationBasicFields on ClassicLocation @_unmask {
    defaultBoxState
    id
    seq
    name
  }
`);

export const TAG_OPTIONS_FRAGMENT = graphql(`
  fragment TagOptions on Tag @_unmask {
    value: id
    label: name
    color
  }
`);

export const DISTRO_EVENT_FIELDS_FRAGMENT = graphql(`
  fragment DistroEventFields on DistributionEvent @_unmask {
    id
    state
    name
    distributionSpot {
      name
    }
    plannedStartDateTime
    plannedEndDateTime
  }
`);

// fragments with references to Basic Fields
export const BASE_ORG_FIELDS_FRAGMENT = graphql(`
  fragment BaseOrgFields on Base @_unmask {
    ...BaseBasicFields
    organisation {
      ...OrganisationBasicFields
    }
  }
`, [ORGANISATION_BASIC_FIELDS_FRAGMENT, BASE_BASIC_FIELDS_FRAGMENT]);

export const HISTORY_FIELDS_FRAGMENT = graphql(`
  fragment HistoryFields on HistoryEntry @_unmask {
    id
    changes
    changeDate
    user {
      ...UserBasicFields
    }
  }
`, [USER_BASIC_FIELDS_FRAGMENT]);

export const SIZE_RANGE_FIELDS_FRAGMENT = graphql(`
  fragment SizeRangeFields on SizeRange @_unmask {
    id
    label
    sizes {
      ...SizeBasicFields
    }
  }
`, [SIZE_BASIC_FIELDS_FRAGMENT]);

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

// complexer fragments
export const PRODUCT_FIELDS_FRAGMENT = graphql(`
  fragment ProductFields on Product @_unmask {
    ...ProductBasicFields
    category {
      name
    }
    sizeRange {
      ...SizeRangeFields
    }
  }
`, [PRODUCT_BASIC_FIELDS_FRAGMENT, SIZE_RANGE_FIELDS_FRAGMENT]);


export const BOX_FIELDS_FRAGMENT = graphql(`
  fragment BoxFields on Box @_unmask {
    id
    labelIdentifier
    state
    product {
      ...ProductBasicFields
    }
    size {
      ...SizeBasicFields
    }
    shipmentDetail {
      id
      shipment {
        id
        labelIdentifier
        state
        details {
          id
          box {
            location {
              ...LocationBasicFields
              base {
                ...BaseBasicFields
              }
            }
            labelIdentifier
          }
          sourceQuantity
          sourceProduct {
            ...ProductBasicFields
          }
          sourceSize {
            ...SizeBasicFields
          }
          sourceLocation {
            ...LocationBasicFields
          }
        }
        targetBase {
          id
          name
          organisation {
            id
            name
          }
        }
      }
    }

    location {
      id
      name
      ... on ClassicLocation {
        defaultBoxState
      }
      base {
        ...BaseBasicFields
      }
    }
    numberOfItems
    tags {
      ...TagBasicFields
    }
    comment
    history {
      ...HistoryFields
    }
    createdOn
    lastModifiedOn
  }
`, [PRODUCT_BASIC_FIELDS_FRAGMENT, SIZE_BASIC_FIELDS_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT, BASE_BASIC_FIELDS_FRAGMENT, HISTORY_FIELDS_FRAGMENT, LOCATION_BASIC_FIELDS_FRAGMENT]);
