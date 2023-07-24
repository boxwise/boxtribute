import { gql } from "@apollo/client";

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
