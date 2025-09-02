import { graphql } from "../../../graphql/graphql";
import { SHIPMENT_FIELDS_FRAGMENT } from "./fragments";

export const UPDATE_SHIPMENT_WHEN_RECEIVING = graphql(
  `
    mutation UpdateShipmentWhenReceiving(
      $id: ID!
      $receivedShipmentDetailUpdateInputs: [ShipmentDetailUpdateInput!]
      $lostBoxLabelIdentifiers: [String!]
    ) {
      updateShipmentWhenReceiving(
        updateInput: {
          id: $id
          receivedShipmentDetailUpdateInputs: $receivedShipmentDetailUpdateInputs
          lostBoxLabelIdentifiers: $lostBoxLabelIdentifiers
        }
      ) {
        ...ShipmentFields
      }
    }
  `,
  [SHIPMENT_FIELDS_FRAGMENT],
);
