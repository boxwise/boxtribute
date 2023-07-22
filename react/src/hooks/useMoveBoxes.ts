import { gql, useApolloClient } from "@apollo/client";
import { useCallback, useState } from "react";
import { useErrorHandling } from "./useErrorHandling";
import { useNotification } from "./useNotification";

interface IMove {
  labelIdentifier: string;
  location: { id: string };
}

// eslint-disable-next-line no-shadow
export enum IMoveBoxesResultKind {
  SUCCESS = "success",
  FAIL = "fail",
  NETWORK_FAIL = "networkFail",
  BAD_USER_INPUT = "badUserInput", // no Boxes were pased to the function
  PARTIAL_FAIL = "partailFail", // Some Boxes where moved and some not
}

export interface IMoveBoxesResult {
  kind: IMoveBoxesResultKind;
  requestedLabelIdentifiers: string[];
  movedLabelIdentifiers?: string[];
  failedLabelIdentifiers?: string[];
  error?: any;
}

export const useMoveBoxes = () => {
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const apolloClient = useApolloClient();

  const moveBoxes = useCallback(
    (labelIdentifiers: string[], newLocationId: number, showToastMessage: boolean = true) => {
      setIsLoading(true);

      // no Boxes were passed
      if (labelIdentifiers.length === 0) {
        setIsLoading(false);
        return {
          kind: IMoveBoxesResultKind.BAD_USER_INPUT,
          requestedLabelIdentifiers: labelIdentifiers,
        } as IMoveBoxesResult;
      }

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

      const gqlRequest = gql`
        ${mutationName}
        ${mutationString}
      `;

      // execute mutation
      return apolloClient
        .mutate({ mutation: gqlRequest, variables })
        .then(({ data, errors }) => {
          setIsLoading(false);
          if ((errors?.length || 0) > 0) {
            // General error
            if (showToastMessage)
              triggerError({
                message: `Could not move ${
                  labelIdentifiers.length === 1 ? "box" : "boxes"
                }. Try again?`,
              });

            return {
              kind: IMoveBoxesResultKind.FAIL,
              requestedLabelIdentifiers: labelIdentifiers,
              error: errors ? errors[0] : undefined,
            } as IMoveBoxesResult;
          }

          const movedLabelIdentifiers: string[] = Object.values(data).reduce(
            (result: string[], move) => {
              const typedMove = move as IMove;
              if (parseInt(typedMove.location.id, 10) === newLocationId) {
                result.push(typedMove.labelIdentifier);
              }
              return result;
            },
            [],
          ) as string[];

          const failedLabelIdentifiers: string[] = labelIdentifiers.filter(
            (labelIdentifier) =>
              !movedLabelIdentifiers.some(
                (movedLabelIdentifier) => movedLabelIdentifier === labelIdentifier,
              ),
          );

          // Not all Boxes were moved
          if (failedLabelIdentifiers.length) {
            return {
              kind: IMoveBoxesResultKind.PARTIAL_FAIL,
              requestedLabelIdentifiers: labelIdentifiers,
              movedLabelIdentifiers,
              failedLabelIdentifiers,
            } as IMoveBoxesResult;
          }

          // All Boxes were moved
          if (showToastMessage) {
            createToast({
              message: `${
                movedLabelIdentifiers.length === 1
                  ? "A Box was"
                  : `${movedLabelIdentifiers.length} Boxes were`
              }  successfully moved.`,
            });
          }
          return {
            kind: IMoveBoxesResultKind.SUCCESS,
            requestedLabelIdentifiers: labelIdentifiers,
            movedLabelIdentifiers,
          } as IMoveBoxesResult;
        })
        .catch(
          // Network error
          (err) => {
            setIsLoading(false);
            if (showToastMessage)
              triggerError({
                message: `Could not move ${
                  labelIdentifiers.length === 1 ? "box" : "boxes"
                }. Try again?`,
              });
            return {
              kind: IMoveBoxesResultKind.NETWORK_FAIL,
              requestedLabelIdentifiers: labelIdentifiers,
              error: err,
            } as IMoveBoxesResult;
          },
        );
    },
    [apolloClient, createToast, triggerError],
  );

  return {
    moveBoxes,
    isLoading,
  };
};
