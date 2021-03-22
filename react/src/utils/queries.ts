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
      box_creation_input: {
        product_id: $productId
        size_id: $sizeId
        items: $items
        location_id: $locationId
        comments: $comments
        qr_barcode: $qrBarcode
      }
    ) {
      id
      box_id
      product_id
      items
    }
  }
`;

export const USER = gql`
  query User($email: String!) {
    user(email: $email) {
      base_id
      name
      usergroup_id
    }
  }
`;

export const ALL_BASES = gql`
  {
    allBases {
      id
      organisationId
      name
    }
  }
`;

export const BASE = gql`
  query Base($baseId: Int!) {
    base(id: $baseId) {
      id
      organisationId
      name
      currencyName
    }
  }
`;

export const ORG_BASES = gql`
  query OrgBases($orgId: Int!) {
    orgBases(org_id: $orgId) {
      id
      organisationId
      name
      currencyName
    }
  }
`;

export const QR_EXISTS = gql`
  query QrExists($qrCode: String!) {
    qrExists(qr_code: $qrCode)
  }
`;

export const QR_BOX_EXISTS = gql`
  query QrBoxExists($qrCode: String!) {
    qrBoxExists(qr_code: $qrCode)
  }
`;

export const BOX_BY_QR = gql`
  query Box($qrCode: String!) {
    box(qr_code: $qrCode) {
      box_id
      product_id
      size_id
      items
      location_id
      comments
      qr_id
      box_state_id
    }
  }
`;
