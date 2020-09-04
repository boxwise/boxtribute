import { gql } from "apollo-boost";

export const CREATE_BOX = gql`
mutation(
  $boxId: Int!
  $productId: Int!
  $items: Int
  $locationId: Int!
  $comments: String!
  $sizeId: Int!
  $qrId: Int!
  $boxStateId: Int!
) {
  createBox(
    input: {
      box_id: $boxId
      product_id: $productId
      size_id: $sizeId
      items: $items
      location_id: $locationId
      comments: $comments
      qr_id: $qrId
      box_state_id: $boxStateId
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
