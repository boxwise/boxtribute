import { gql } from "@apollo/client";
import { SHIPMENT_FIELDS_FRAGMENT, BOX_FIELDS_FRAGMENT } from "./fragments";

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

export const ALL_SHIPMENTS_QUERY = gql`
  ${SHIPMENT_FIELDS_FRAGMENT}
  query Shipments {
    shipments {
      ...ShipmentFields
    }
  }
`;
