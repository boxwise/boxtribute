import { gql } from "@apollo/client";
import { PRODUCT_BASIC_FIELDS_FRAGMENT, SIZE_FIELDS_FRAGMENT } from "./fragments";

export const BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY = gql`
  ${SIZE_FIELDS_FRAGMENT}
  ${PRODUCT_BASIC_FIELDS_FRAGMENT}
  query BoxDetails($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      labelIdentifier
      product {
        ...ProductBasicFields
      }
      size {
        ...SizeFields
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
  ${SIZE_FIELDS_FRAGMENT}
  ${PRODUCT_BASIC_FIELDS_FRAGMENT}
  query GetBoxLabelIdentifierForQrCode($qrCode: String!) {
    qrCode(qrCode: $qrCode) {
      box {
        id
        labelIdentifier
        product {
          ...ProductBasicFields
        }
        size {
          ...SizeFields
        }
        numberOfItems
        location {
          base {
            id
          }
        }
      }
    }
  }
`;

export const CHECK_IF_QR_EXISTS_IN_DB = gql`
  query CheckIfQrExistsInDb($qrCode: String!) {
    qrExists(qrCode: $qrCode)
  }
`;
