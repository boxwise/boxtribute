import { gql } from "apollo-boost";

export const CREATE_BOX = gql`
mutation(
  $productId: Int!
  $items: Int!
  $locationId: Int!
  $comments: String!
  $sizeId: Int
  $qrBarcode: String!
  $createdBy: String!
) {
  createBox(
    input: {
      product_id: $productId
      size_id: $sizeId
      items: $items
      location_id: $locationId
      comments: $comments
      qr_barcode: $qrBarcode
      created_by: $createdBy
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
    usergroups_id
  }
}
`;
