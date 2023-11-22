import { gql } from "@apollo/client";

export interface IMove {
  labelIdentifier: string;
  location: { id: string };
}

// helper function to check type of dynamically created query
export function isMove(move: any): move is IMove {
  return (
    typeof move === "object" &&
    move !== null &&
    move !== undefined &&
    "labelIdentifier" in move &&
    "location" in move &&
    typeof move.location === "object" &&
    move.location !== null &&
    move.location !== undefined &&
    "id" in move.location
  );
}

export const generateMoveBoxRequest = (labelIdentifiers: string[], newLocationId: number) => {
  // prepare graphQL request
  // It is using aliases and will be similar to:
  // mutation MoveBoxes($newLocationId: Int!, $labelIdentifier0: String!) {
  //  moveBox123456: updateBox(
  //    updateInput: { labelIdentifier: $labelIdentifier0, locationId: $newLocationId }
  //  ) {
  //   labelIdentifier
  //   state
  //   location {
  //     id
  //   }
  //  }
  // }
  let mutationName = "mutation MoveBoxes($newLocationId: Int!";
  let mutationString = "{";
  const variables = { newLocationId };

  labelIdentifiers.forEach((labelIdentifier, index) => {
    mutationName += `, $labelIdentifier${index}: String!`;
    mutationString += `
        moveBox${labelIdentifier}: updateBox(
          updateInput: { labelIdentifier: $labelIdentifier${index}, locationId: $newLocationId }
        ) {
          labelIdentifier
          state
          location {
            id
          }
        } `;
    variables[`labelIdentifier${index}`] = labelIdentifier;
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

export interface IAssign {
  labelIdentifier: string;
  tags: { id: string }[];
}

// // helper function to check type of dynamically created query
export function isAssign(obj: any): obj is IAssign {
  return (
    typeof obj === "object" &&
    obj !== null &&
    obj !== undefined &&
    "labelIdentifier" in obj &&
    "tags" in obj &&
    Array.isArray(obj.tags) &&
    obj.tags.every((tag: any) => typeof tag === "object" && "id" in tag)
  );
}

export const generateAssignTagsRequest = (labelIdentifiers: string[], tagIds: number[]) => {
  // prepare graphQL request
  // It is using aliases and will be similar to:
  // mutation AssignTags($tagIds: [Int!]!, $labelIdentifier0: String!) {
  //  assignTagsToBox123456: updateBox(
  //    updateInput: { labelIdentifier: $labelIdentifier0, tagIdsToBeAdded: $tagIds }
  //  ) {
  //   labelIdentifier
  //   tags {
  //     id
  //   }
  //  }
  // }
  let mutationName = "mutation AssignTags($tagIds: [Int!]!";
  let mutationString = "{";
  const variables = { tagIds };

  labelIdentifiers.forEach((labelIdentifier, index) => {
    mutationName += `, $labelIdentifier${index}: String!`;
    mutationString += `
        assignTagsToBox${labelIdentifier}: updateBox(
          updateInput: { labelIdentifier: $labelIdentifier${index}, tagIdsToBeAdded: $tagIds }
        ) {
          labelIdentifier
          tags {
            id
          }
        } `;
    variables[`labelIdentifier${index}`] = labelIdentifier;
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

export interface IUnassignmentFromShipment {
  id: string;
  details: {
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
