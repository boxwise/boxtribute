import { gql } from "@apollo/client";

// Basic Fields without reference to other fragments first
export const ORGANISATION_BASIC_FIELDS_FRAGMENT = gql`
  fragment OrganisationBasicFields on Organisation {
    id
    name
  }
`;

export const BASE_BASIC_FIELDS_FRAGMENT = gql`
  fragment BaseBasicFields on Base {
    id
    name
  }
`;

export const USER_BASIC_FIELDS_FRAGMENT = gql`
  fragment UserBasicFields on User {
    id
    name
  }
`;

export const PRODUCT_BASIC_FIELDS_FRAGMENT = gql`
  fragment ProductBasicFields on Product {
    id
    name
    gender
    deletedOn
  }
`;

export const SIZE_BASIC_FIELDS_FRAGMENT = gql`
  fragment SizeBasicFields on Size {
    id
    label
  }
`;

export const LOCATION_BASIC_FIELDS_FRAGMENT = gql`
  fragment LocationBasicFields on ClassicLocation {
    defaultBoxState
    id
    seq
    name
  }
`;

export const TAG_BASIC_FIELDS_FRAGMENT = gql`
  fragment TagBasicFields on Tag {
    id
    name
    color
    description
    type
  }
`;

export const TAG_OPTIONS_FRAGMENT = gql`
  fragment TagOptions on Tag {
    value: id
    label: name
    color
  }
`;

export const DISTRO_EVENT_FIELDS_FRAGMENT = gql`
  fragment DistroEventFields on DistributionEvent {
    id
    state
    name
    distributionSpot {
      name
    }
    plannedStartDateTime
    plannedEndDateTime
  }
`;

// fragments with references to Basic Fields
export const BASE_ORG_FIELDS_FRAGMENT = gql`
  ${BASE_BASIC_FIELDS_FRAGMENT}
  ${ORGANISATION_BASIC_FIELDS_FRAGMENT}
  fragment BaseOrgFields on Base {
    ...BaseBasicFields
    organisation {
      ...OrganisationBasicFields
    }
  }
`;

export const HISTORY_FIELDS_FRAGMENT = gql`
  ${USER_BASIC_FIELDS_FRAGMENT}
  fragment HistoryFields on HistoryEntry {
    id
    changes
    changeDate
    user {
      ...UserBasicFields
    }
  }
`;

export const SIZE_RANGE_FIELDS_FRAGMENT = gql`
  ${SIZE_BASIC_FIELDS_FRAGMENT}
  fragment SizeRangeFields on SizeRange {
    id
    label
    sizes {
      ...SizeBasicFields
    }
  }
`;

export const BOX_BASIC_FIELDS_FRAGMENT = gql`
  fragment BoxBasicFields on Box {
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
`;

export const BOX_FIELDS_FRAGMENT = gql`
  ${PRODUCT_BASIC_FIELDS_FRAGMENT}
  ${SIZE_BASIC_FIELDS_FRAGMENT}
  ${TAG_BASIC_FIELDS_FRAGMENT}
  ${BASE_BASIC_FIELDS_FRAGMENT}
  ${HISTORY_FIELDS_FRAGMENT}
  ${LOCATION_BASIC_FIELDS_FRAGMENT}
  fragment BoxFields on Box {
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
`;

export const BOX_WITH_SIZE_TAG_PRODUCT_FIELDS_FRAGMENT = gql`
  ${SIZE_BASIC_FIELDS_FRAGMENT}
  ${PRODUCT_BASIC_FIELDS_FRAGMENT}
  ${TAG_BASIC_FIELDS_FRAGMENT}
  ${DISTRO_EVENT_FIELDS_FRAGMENT}
  fragment BoxWithSizeTagProductFields on Box {
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
`;

export const TRANSFER_AGREEMENT_FIELDS_FRAGMENT = gql`
  ${ORGANISATION_BASIC_FIELDS_FRAGMENT}
  ${BASE_BASIC_FIELDS_FRAGMENT}
  ${USER_BASIC_FIELDS_FRAGMENT}
  fragment TransferAgreementFields on TransferAgreement {
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
`;

// complexer fragments
export const PRODUCT_FIELDS_FRAGMENT = gql`
  ${PRODUCT_BASIC_FIELDS_FRAGMENT}
  ${SIZE_RANGE_FIELDS_FRAGMENT}
  fragment ProductFields on Product {
    ...ProductBasicFields
    category {
      name
    }
    sizeRange {
      ...SizeRangeFields
    }
  }
`;

export const SHIPMENT_DETAIL_FIELDS_FRAGMENT = gql`
  ${BOX_BASIC_FIELDS_FRAGMENT}
  ${USER_BASIC_FIELDS_FRAGMENT}
  ${PRODUCT_FIELDS_FRAGMENT}
  ${SIZE_BASIC_FIELDS_FRAGMENT}
  fragment ShipmentDetailFields on ShipmentDetail {
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
`;

export const SHIPMENT_FIELDS_FRAGMENT = gql`
  ${BASE_ORG_FIELDS_FRAGMENT}
  ${USER_BASIC_FIELDS_FRAGMENT}
  ${SHIPMENT_DETAIL_FIELDS_FRAGMENT}
  fragment ShipmentFields on Shipment {
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
`;
