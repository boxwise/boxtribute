import { gql } from "@apollo/client";
import {
  BOX_FIELDS_FRAGMENT,
  PRODUCT_FIELDS_FRAGMENT,
  SHIPMENT_FIELDS_FRAGMENT,
  TAG_OPTIONS_FRAGMENT,
} from "./fragments";

export const BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY = gql`
  ${BOX_FIELDS_FRAGMENT}
  query BoxDetails($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      ...BoxFields
    }
  }
`;

export const GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE = gql`
  ${BOX_FIELDS_FRAGMENT}
  query GetBoxLabelIdentifierForQrCode($qrCode: String!) {
    qrCode(qrCode: $qrCode) {
      code
      box {
        ...BoxFields
      }
    }
  }
`;

export const CHECK_IF_QR_EXISTS_IN_DB = gql`
  query CheckIfQrExistsInDb($qrCode: String!) {
    qrExists(qrCode: $qrCode)
  }
`;

export const SHIPMENT_BY_ID_QUERY = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  query ShipmentById($id: ID!) {
    shipment(id: $id) {
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
