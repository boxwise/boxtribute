import { gql } from "@apollo/client";
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
export const ORGANISATION_AND_BASES_QUERY = gql`
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
`;

export const BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY = gql`
  ${BOX_FIELDS_FRAGMENT}
  query BoxDetails($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      ...BoxFields
    }
  }
`;

export const GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE = gql`
  ${BOX_BASIC_FIELDS_FRAGMENT}
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
`;

export const CHECK_IF_QR_EXISTS_IN_DB = gql`
  query CheckIfQrExistsInDb($qrCode: String!) {
    qrExists(code: $qrCode)
  }
`;

export const ALL_SHIPMENTS_QUERY = gql`
  ${BASE_ORG_FIELDS_FRAGMENT}
  query Shipments {
    shipments {
      id
      labelIdentifier
      state
      details {
        id
        box {
          labelIdentifier
        }
        createdOn
        removedOn
      }
      sourceBase {
        ...BaseOrgFields
      }
      targetBase {
        ...BaseOrgFields
      }
      startedOn
      sentOn
      receivingStartedOn
      completedOn
      canceledOn
    }
  }
`;

export const BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY = gql`
  ${PRODUCT_BASIC_FIELDS_FRAGMENT}
  ${BOX_FIELDS_FRAGMENT}
  ${TAG_BASIC_FIELDS_FRAGMENT}
  ${DISTRO_EVENT_FIELDS_FRAGMENT}
  ${SHIPMENT_FIELDS_FRAGMENT}
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
`;

export const SHIPMENT_BY_ID_WITH_PRODUCTS_AND_LOCATIONS_QUERY = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  ${TAG_OPTIONS_FRAGMENT}
  ${PRODUCT_FIELDS_FRAGMENT}
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
`;

export const MULTI_BOX_ACTION_OPTIONS_FOR_LOCATIONS_TAGS_AND_SHIPMENTS_QUERY = gql`
  ${LOCATION_BASIC_FIELDS_FRAGMENT}
  ${TAG_BASIC_FIELDS_FRAGMENT}
  ${BASE_ORG_FIELDS_FRAGMENT}
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
`;
