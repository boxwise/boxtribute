import { graphql } from "../../../graphql"
import {
  BOX_FIELDS_FRAGMENT,
  PRODUCT_FIELDS_FRAGMENT,
  TAG_OPTIONS_FRAGMENT,
  SHIPMENT_FIELDS_FRAGMENT,
  BOX_BASIC_FIELDS_FRAGMENT,
  PRODUCT_BASIC_FIELDS_FRAGMENT,
  TAG_BASIC_FIELDS_FRAGMENT,
  DISTRO_EVENT_FIELDS_FRAGMENT,
  BASE_ORG_FIELDS_FRAGMENT,
  LOCATION_BASIC_FIELDS_FRAGMENT,
} from "./fragments";

// very first query that is always executed
export const ORGANISATION_AND_BASES_QUERY = graphql(`
  query OrganisationAndBases {
    bases {
      id
      name
      organisation {
        id
        name
      }
    }
  }
`);

export const BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY = graphql(`
  query BoxDetails($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      ...BoxFields
    }
  }
`, [BOX_FIELDS_FRAGMENT]);

export const GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE = graphql(`
  query GetBoxLabelIdentifierForQrCode($qrCode: String!) {
    qrCode(code: $qrCode) {
      __typename
      ... on QrCode {
        code
        # if box is null NOT_ASSIGNED_TO_BOX
        box {
          __typename
          # SUCCESS
          ... on Box {
            ...BoxBasicFields
          }
          # NOT_AUTHORIZED_FOR_BOX
          ... on InsufficientPermissionError {
            permissionName: name
          }
          # NOT_AUTHORIZED_FOR_BASE
          ... on UnauthorizedForBaseError {
            baseName: name
            organisationName
          }
        }
      }
      # NOT_AUTHORIZED_FOR_QR
      ... on InsufficientPermissionError {
        permissionName: name
      }
      # NO_BOXTRIBUTE_QR
      ... on ResourceDoesNotExistError {
        resourceName: name
      }
    }
  }
`, [BOX_BASIC_FIELDS_FRAGMENT]);

export const CHECK_IF_QR_EXISTS_IN_DB = graphql(`
  query CheckIfQrExistsInDb($qrCode: String!) {
    qrExists(code: $qrCode)
  }
`);

export const ALL_SHIPMENTS_QUERY = graphql(`
  query Shipments {
    shipments {
      ...ShipmentFields
    }
  }
`, [SHIPMENT_FIELDS_FRAGMENT]);

export const BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY = graphql(`
  query BoxByLabelIdentifier($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      ...BoxFields
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
        __typename
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
    }
    shipments {
      ...ShipmentFields
    }
  }
`, [PRODUCT_BASIC_FIELDS_FRAGMENT, BOX_FIELDS_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT, DISTRO_EVENT_FIELDS_FRAGMENT, SHIPMENT_FIELDS_FRAGMENT]);

export const SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY = graphql(`
  query ShipmentByIdWithProductsAndLocations($shipmentId: ID!, $baseId: ID!) {
    shipment(id: $shipmentId) {
      ...ShipmentFields
    }

    base(id: $baseId) {
      tags(resourceType: Box) {
        ...TagOptions
      }
      locations {
        ... on ClassicLocation {
          defaultBoxState
        }
        id
        seq
        name
      }

      products {
        ...ProductFields
      }
    }
  }
`, [SHIPMENT_FIELDS_FRAGMENT, TAG_OPTIONS_FRAGMENT, PRODUCT_FIELDS_FRAGMENT]);

export const MULTI_BOX_ACTION_OPTIONS_FOR_LOCATIONS_TAGS_AND_SHIPMENTS_QUERY = graphql(`
  query MultiBoxActionOptionsForLocationsTagsAndShipments($baseId: ID!) {
    base(id: $baseId) {
      tags(resourceType: Box) {
        ...TagBasicFields
      }
      locations {
        ...LocationBasicFields
      }
    }
    shipments {
      id
      state
      labelIdentifier
      sourceBase {
        ...BaseOrgFields
      }
      targetBase {
        ...BaseOrgFields
      }
    }
  }
`, [LOCATION_BASIC_FIELDS_FRAGMENT, TAG_BASIC_FIELDS_FRAGMENT, BASE_ORG_FIELDS_FRAGMENT]);

export const LOCATIONS_QUERY = graphql(`
  query Locations {
    locations {
      id
      name
      defaultBoxState
      seq
    }
  }
  `)

export const BOX_QUERY = graphql(`
  query Box($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      id
      labelIdentifier
      state
      comment
      numberOfItems
      product {
        id
        name
        gender
        deletedOn
      }
      history {
        id
        changes
        changeDate
        user {
          id 
          name
        }
      }
      size {
        id
        label
      }
      tags {
        id
        name
        color
        description
        type
      }
      shipmentDetail {
        id
        createdBy {
          id
        }
        createdOn
        removedBy {
          id
        }
        removedOn
        lostBy {
          id
        }
        shipment {
          id
          targetBase {
            id
            name
            currencyName
            organisation {
              id
              name
            }
          }
          details {
            id
            sourceProduct {
              id
              name
              gender
            }
            sourceLocation{
              id
              name
            }
            sourceSize {
              id
              label
            }
            sourceQuantity
            box {
              id
              labelIdentifier
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
          locations {
            id
            name
            seq
            defaultBoxState
          }
        }
      }
    }
  }
  `)

export const USER_QUERY = graphql(`
  query User {
    users {
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
  }
  `)
