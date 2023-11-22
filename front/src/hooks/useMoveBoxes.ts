import { DocumentNode, useApolloClient } from "@apollo/client";
import { useCallback, useState } from "react";
import { generateMoveBoxRequest, isMove, IMove } from "queries/dynamic-mutations";
import { useErrorHandling } from "./useErrorHandling";
import { useNotification } from "./useNotification";

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

export interface IUseMoveBoxesReturnType {
  moveBoxes: (
    labelIdentifiers: string[],
    newLocationId: number,
    showToasts?: boolean,
    showErrors?: boolean,
  ) => IMoveBoxesResult | Promise<IMoveBoxesResult>;
  isLoading: boolean;
}

export const useMoveBoxes = (
  refetchQueries: Array<{ query: DocumentNode; variables?: any }> = [],
) => {
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const apolloClient = useApolloClient();

  const moveBoxes = useCallback(
    (
      labelIdentifiers: string[],
      newLocationId: number,
      showToasts: boolean = true,
      showErrors: boolean = true,
    ) => {
      setIsLoading(true);

      // TODO: Validate here that Boxes are in the right state
      // no Boxes were passed
      if (labelIdentifiers.length === 0) {
        setIsLoading(false);
        return {
          kind: IMoveBoxesResultKind.BAD_USER_INPUT,
          requestedLabelIdentifiers: labelIdentifiers,
        } as IMoveBoxesResult;
      }

      const gqlRequestPrep = generateMoveBoxRequest(labelIdentifiers, newLocationId);

      // execute mutation
      return apolloClient
        .mutate({
          mutation: gqlRequestPrep.gqlRequest,
          variables: gqlRequestPrep.variables,
          refetchQueries,
        })
        .then(({ data, errors }) => {
          setIsLoading(false);
          if ((errors?.length || 0) > 0) {
            // General error
            if (showErrors)
              triggerError({
                message: `Could not move ${
                  labelIdentifiers.length === 1 ? "box" : "boxes"
                }. Try again?`,
              });

            return {
              kind: IMoveBoxesResultKind.FAIL,
              requestedLabelIdentifiers: labelIdentifiers,
              failedLabelIdentifiers: labelIdentifiers,
              error: errors ? errors[0] : undefined,
            } as IMoveBoxesResult;
          }

          const movedLabelIdentifiers: string[] = Object.values(data).reduce(
            (result: string[], move) => {
              if (isMove(move)) {
                const typedMove = move as IMove;
                if (parseInt(typedMove.location.id, 10) === newLocationId) {
                  result.push(typedMove.labelIdentifier);
                }
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

          if (showToasts && movedLabelIdentifiers.length > 0) {
            createToast({
              message: `${
                movedLabelIdentifiers.length === 1
                  ? "A Box was"
                  : `${movedLabelIdentifiers.length} Boxes were`
              } successfully moved.`,
            });
          }

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
            if (showErrors)
              triggerError({
                message: `Network issue: could not move ${
                  labelIdentifiers.length === 1 ? "box" : "boxes"
                }. Try again?`,
              });
            return {
              kind: IMoveBoxesResultKind.NETWORK_FAIL,
              requestedLabelIdentifiers: labelIdentifiers,
              failedLabelIdentifiers: labelIdentifiers,
              error: err,
            } as IMoveBoxesResult;
          },
        );
    },
    [apolloClient, createToast, refetchQueries, triggerError],
  );

  return {
    moveBoxes,
    isLoading,
  };
};
