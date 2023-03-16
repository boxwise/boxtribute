import { gql } from "@apollo/client";
import { BOX_FIELDS_FRAGMENT } from "./fragments";

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
