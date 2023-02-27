import { gql } from "@apollo/client";
import { BOX_FIELDS_FRAGMENT } from "./fragments";

// query to get scanned boxes from cache
// scannedboxes is a local-only field and only exists in the cache
// https://www.apollographql.com/docs/react/local-state/managing-state-with-field-policies
// TODO: figure out how to properly reference Boxes here. At the moment we only have
//       an array of ids and states in the cache. The reference to the Box is somewhere lost
export const GET_SCANNED_BOXES = gql`
  query GetScannedBoxes {
    scannedBoxes @client {
      __typename
      labelIdentifier
      state
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
  ${BOX_FIELDS_FRAGMENT}
  query GetBoxLabelIdentifierForQrCode($qrCode: String!) {
    qrCode(qrCode: $qrCode) {
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
