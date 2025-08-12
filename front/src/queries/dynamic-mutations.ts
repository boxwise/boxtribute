import { gql } from "@apollo/client";

export interface IUnassignmentFromShipment {
  id: string;
  details: {
    removedOn: any | null;
    box: {
      labelIdentifier: string;
    };
  }[];
}

// helper function to check type of dynamically created query
export function isUnassignmentFromShipment(
  unassignment: any,
): unassignment is IUnassignmentFromShipment {
  return (
    typeof unassignment === "object" &&
    unassignment !== null &&
    unassignment !== undefined &&
    "details" in unassignment &&
    Array.isArray(unassignment.details) &&
    unassignment.details.every(
      (detail) =>
        typeof detail === "object" &&
        detail !== null &&
        detail !== undefined &&
        "box" in detail &&
        typeof detail.box === "object" &&
        detail.box !== null &&
        detail.box !== undefined &&
        "labelIdentifier" in detail.box,
    )
  );
}

export const generateUnassignBoxesFromShipmentsRequest = (
  shipmentBoxDictionary: Record<string, string[]>,
) => {
  // prepare graphQL request
  // It is using aliases and will be similar to:
  // mutation UnassignBoxesFromShipments($shipment0: Int!, $labelIdentifiers0: [String!]!) {
  //  unassignBoxesFromShipment123: updateShipmentWhenPreparing(
  //    updateInput: {
  //      id: $shipment0,
  //      preparedBoxLabelIdentifiers: [],
  //      removedBoxLabelIdentifiers: $labelIdentifiers0
  //    }
  //  ) {
  //   id
  //   details {
  //     id
  //     removedOn
  //     removedBy {
  //       id
  //     }
  //     box {
  //       labelIdentifier
  //       state
  //       shipmentDetail {
  //         id
  //       }
  //       lastModifiedOn
  //     }
  //   }
  //  }
  // }
  let mutationName = "mutation UnassignBoxesFromShipments(";
  let mutationString = "{";
  const variables = {};

  Object.entries(shipmentBoxDictionary).forEach(([shipmentId, labelIdentifiers], index) => {
    mutationName += `${
      index === 0 ? "" : ", "
    }$shipment${index}: ID!, $labelIdentifiers${index}: [String!]!`;
    mutationString += `
      unassignBoxesFromShipment${shipmentId}: updateShipmentWhenPreparing(
        updateInput: {
          id: $shipment${index},
          preparedBoxLabelIdentifiers: [],
          removedBoxLabelIdentifiers: $labelIdentifiers${index}
        }
      ) {
        id
        details {
          id
          removedOn
          removedBy {
            id
          }
          box {
            labelIdentifier
            state
            shipmentDetail {
              id
            }
            lastModifiedOn
          }
        }
      }
    `;
    variables[`shipment${index}`] = shipmentId;
    variables[`labelIdentifiers${index}`] = labelIdentifiers;
  });
  mutationName += ")";
  mutationString += "}";

  return {
    gqlRequest: gql`
      ${mutationName}
      ${mutationString}
    `,
    variables,
  };
};
