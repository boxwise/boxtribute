import { gql } from "@apollo/client";

export const BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY = gql`
  query BoxDetails($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      labelIdentifier
      product {
        id
        name
        gender
      }
      size {
        id
        label
      }
      location {
        id
        name
        base {
          id
          name
        }
      }
      numberOfItems
    }
  }
`;

export const GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE = gql`
  query GetBoxLabelIdentifierForQrCode($qrCode: String!) {
    qrCode(qrCode: $qrCode) {
      box {
        id
        labelIdentifier
        product {
          id
          name
          gender
        }
        size {
          id
          label
        }
        numberOfItems
      }
    }
  }
`;

export const CHECK_IF_QR_EXISTS_IN_DB = gql`
  query CheckIfQrExistsInDb($qrCode: String!) {
    qrExists(qrCode: $qrCode)
  }
`;
