import { gql } from "@apollo/client";

export const CREATE_BOX = gql`
  mutation(
    $productId: Int!
    $items: Int!
    $locationId: Int!
    $comments: String!
    $sizeId: Int
    $qrBarcode: String!
  ) {
    createBox(
      boxCreationInput: {
        productId: $productId
        sizeId: $sizeId
        items: $items
        locationId: $locationId
        comment: $comments
        qrCode: $qrBarcode
      }
    ) {
      boxLabelIdentifier
      product {
        id
      }
      size
      items
      location {
        id
      }
      comment
      qrCode {
        id
      }
      state
    }
  }
`;

export const USER = gql`
  query User($email: String!) {
    user(email: $email) {
      bases {
        id
      }
      name
    }
  }
`;

export const ALL_BASES = gql`
  {
    bases {
      id
      organisation {
        id
      }
      name
    }
  }
`;

export const BASE = gql`
  query Base($baseId: Int!) {
    base(id: $baseId) {
      id
      organisation {
        id
      }
      name
      currencyName
    }
  }
`;

export const ORG_BASES = gql`
  query OrgBases($orgId: Int!) {
    organisation(id: $orgId) {
      bases {
        id
        organisation {
          id
        }
        name
        currencyName
      }
    }
  }
`;

export const QR_EXISTS = gql`
  query QrExists($qrCode: String!) {
    qrExists(qrCode: $qrCode)
  }
`;

export const BOX_BY_QR = gql`
  query Box($qrCode: String!) {
    qrCode(qrCode: $qrCode) {
      box {
        boxLabelIdentifier
        product {
          name
          gender
        }
        size
        items
        location {
          id
        }
        comment
        qrCode {
          id
        }
        state
      }
    }
  }
`;

export const LOCATIONS = gql`
  query Locations {
    locations {
      id
      name
    }
  }
`;

export const PRODUCTS = gql`
  query Products {
    products {
      id
      name
    }
  }
`;

export const SIZES_FOR_PRODUCT = gql`
  query SizesForProduct($productId: Int!) {
    product(id: $productId) {
      sizes
    }
  }
`;
