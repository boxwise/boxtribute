import { graphql } from "../../../graphql"

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
    gender
    deletedOn
  }
`);

export const SIZE_BASIC_FIELDS_FRAGMENT = graphql(`
  fragment SizeBasicFields on Size @_unmask {
    id
    label
  }
`);

export const LOCATION_BASIC_FIELDS_FRAGMENT = graphql(`
  fragment LocationBasicFields on ClassicLocation @_unmask {
    defaultBoxState
    id
    seq
    name
  }
`);

export const TAG_BASIC_FIELDS_FRAGMENT = graphql(`
  fragment TagBasicFields on Tag @_unmask {
    id
    name
    color
    description
    type
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

export const BOX_FIELDS_FRAGMENT = graphql(`
  fragment BoxFields on Box @_unmask {
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

export const BOX_WITH_SIZE_TAG_PRODUCT_FIELDS_FRAGMENT = graphql(`
  fragment BoxWithSizeTagProductFields on Box @_unmask {
    labelIdentifier
    state
    size {
      ...SizeBasicFields
    }
    numberOfItems
    comment
    product {
      ...ProductBasicFields
    }
    tags {
      ...TagBasicFields
    }
    distributionEvent {
      ...DistroEventFields
    }
    location {
      id
      name
      ... on ClassicLocation {
        defaultBoxState
      }
      base {
        locations {
          id
          seq
          name
          ... on ClassicLocation {
            defaultBoxState
          }
        }
        distributionEventsBeforeReturnedFromDistributionState {
          id
          state
          distributionSpot {
            name
          }
          name
          plannedStartDateTime
          plannedEndDateTime
        }
      }
    }
    lastModifiedOn
  }
`, [SIZE_BASIC_FIELDS_FRAGMENT, PRODUCT_BASIC_FIELDS_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT, DISTRO_EVENT_FIELDS_FRAGMENT]);

export const TRANSFER_AGREEMENT_FIELDS_FRAGMENT = graphql(`
  fragment TransferAgreementFields on TransferAgreement @_unmask {
    id
    type
    state
    comment
    validFrom
    validUntil
    sourceOrganisation {
      ...OrganisationBasicFields
    }
    sourceBases {
      ...BaseBasicFields
    }
    targetOrganisation {
      ...OrganisationBasicFields
    }
    targetBases {
      ...BaseBasicFields
    }
    shipments {
      id
      state
      sourceBase {
        ...BaseBasicFields
      }
      targetBase {
        ...BaseBasicFields
      }
    }
    requestedOn
    requestedBy {
      ...UserBasicFields
    }
    acceptedOn
    acceptedBy {
      ...UserBasicFields
    }
    terminatedOn
    terminatedBy {
      ...UserBasicFields
    }
  }
`, [ORGANISATION_BASIC_FIELDS_FRAGMENT, BASE_BASIC_FIELDS_FRAGMENT, USER_BASIC_FIELDS_FRAGMENT]);

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

export const SHIPMENT_DETAIL_FIELDS_FRAGMENT = graphql(`
  fragment ShipmentDetailFields on ShipmentDetail @_unmask {
    id
    box {
      ...BoxBasicFields
    }
    sourceProduct {
      ...ProductFields
    }
    targetProduct {
      ...ProductFields
    }
    sourceSize {
      ...SizeBasicFields
    }
    targetSize {
      ...SizeBasicFields
    }
    sourceLocation {
      id
      name
      ... on ClassicLocation {
        defaultBoxState
      }
    }
    sourceQuantity
    targetQuantity
    createdOn
    createdBy {
      ...UserBasicFields
    }
    removedOn
    removedBy {
      ...UserBasicFields
    }
    lostOn
    lostBy {
      ...UserBasicFields
    }
    receivedOn
    receivedBy {
      ...UserBasicFields
    }
  }
`, [BOX_BASIC_FIELDS_FRAGMENT, USER_BASIC_FIELDS_FRAGMENT, PRODUCT_FIELDS_FRAGMENT, SIZE_BASIC_FIELDS_FRAGMENT]);

export const SHIPMENT_FIELDS_FRAGMENT = graphql(`
  fragment ShipmentFields on Shipment @_unmask {
    id
    labelIdentifier
    state
    details {
      ...ShipmentDetailFields
    }
    sourceBase {
      ...BaseOrgFields
    }
    targetBase {
      ...BaseOrgFields
    }
    transferAgreement {
      id
      comment
      type
    }
    startedOn
    startedBy {
      ...UserBasicFields
    }
    sentOn
    sentBy {
      ...UserBasicFields
    }
    receivingStartedOn
    receivingStartedBy {
      ...UserBasicFields
    }
    completedOn
    completedBy {
      ...UserBasicFields
    }
    canceledOn
    canceledBy {
      ...UserBasicFields
    }
  }
`, [BASE_ORG_FIELDS_FRAGMENT, SHIPMENT_DETAIL_FIELDS_FRAGMENT]);
