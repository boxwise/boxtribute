import { useMutation } from "@apollo/client/react";
import { useCallback, useState } from "react";
import { graphql } from "../../../graphql/graphql";
import { useErrorHandling } from "./useErrorHandling";
import { useNotification } from "./useNotification";

export enum IMoveBoxesResultKind {
  SUCCESS = "success",
  FAIL = "fail",
  NETWORK_FAIL = "networkFail",
  BAD_USER_INPUT = "badUserInput", // no Boxes were passed to the function
  SUCCESS_WITH_BOXES_ALREADY_AT_TARGET = "partialSuccess", // Some Boxes are already at the target location
  NOT_AUTHORIZED = "notAuthorized", // Permission errors
  RESOURCE_NOT_FOUND = "resourceNotFound", // Location doesn't exist
  UNAUTHORIZED_FOR_BASE = "unauthorizedForBase", // Base access issue
  DELETED_LOCATION = "deletedLocation", // Location has been deleted
}

export interface IMoveBoxesResult {
  kind: IMoveBoxesResultKind;
  requestedLabelIdentifiers: string[];
  movedLabelIdentifiers?: string[];
  failedLabelIdentifiers?: string[];
  error?: any;
}

export const MOVE_BOXES_TO_LOCATION = graphql(`
  mutation MoveBoxesToLocation($labelIdentifiers: [String!]!, $locationId: Int!) {
    moveBoxesToLocation(
      updateInput: { labelIdentifiers: $labelIdentifiers, locationId: $locationId }
    ) {
      __typename
      ... on BoxesResult {
        updatedBoxes {
          labelIdentifier
          state
          location {
            id
          }
          lastModifiedOn
        }
        invalidBoxLabelIdentifiers
      }
      ... on InsufficientPermissionError {
        name
      }
      ... on ResourceDoesNotExistError {
        name
      }
      ... on UnauthorizedForBaseError {
        name
      }
      ... on DeletedLocationError {
        name
      }
    }
  }
`);

export interface IUseMoveBoxesReturnType {
  moveBoxes: (
    labelIdentifiers: string[],
    newLocationId: number,
    showToasts?: boolean,
    showErrors?: boolean,
  ) => IMoveBoxesResult | Promise<IMoveBoxesResult>;
  isLoading: boolean;
}

export const useMoveBoxes = () => {
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [moveBoxesMutation] = useMutation(MOVE_BOXES_TO_LOCATION);

  const moveBoxes = useCallback(
    (
      labelIdentifiers: string[],
      newLocationId: number,
      showToasts: boolean = true,
      showErrors: boolean = true,
    ) => {
      setIsLoading(true);

      // no Boxes were passed
      if (labelIdentifiers.length === 0) {
        setIsLoading(false);
        return Promise.resolve({
          kind: IMoveBoxesResultKind.BAD_USER_INPUT,
          requestedLabelIdentifiers: labelIdentifiers,
        } as IMoveBoxesResult);
      }

      // execute mutation
      return moveBoxesMutation({
        variables: {
          labelIdentifiers,
          locationId: newLocationId,
        },
      })
        .then(({ data, error }) => {
          setIsLoading(false);

          if (error) {
            // General error
            if (showErrors) {
              triggerError({
                message: `Could not move ${
                  labelIdentifiers.length === 1 ? "box" : "boxes"
                }. Try again?`,
              });
            }

            return {
              kind: IMoveBoxesResultKind.FAIL,
              requestedLabelIdentifiers: labelIdentifiers,
              failedLabelIdentifiers: labelIdentifiers,
              error: error,
            } as IMoveBoxesResult;
          }

          const resultType = data?.moveBoxesToLocation?.__typename;

          if (resultType === "InsufficientPermissionError") {
            if (showErrors)
              triggerError({
                message: `You don't have the permissions to move ${
                  labelIdentifiers.length === 1 ? "this box" : "these boxes"
                }.`,
              });
            return {
              kind: IMoveBoxesResultKind.NOT_AUTHORIZED,
              requestedLabelIdentifiers: labelIdentifiers,
              failedLabelIdentifiers: labelIdentifiers,
            } as IMoveBoxesResult;
          }

          if (resultType === "ResourceDoesNotExistError") {
            if (showErrors)
              triggerError({
                message: `The target location does not exist.`,
              });
            return {
              kind: IMoveBoxesResultKind.RESOURCE_NOT_FOUND,
              requestedLabelIdentifiers: labelIdentifiers,
              failedLabelIdentifiers: labelIdentifiers,
            } as IMoveBoxesResult;
          }

          if (resultType === "UnauthorizedForBaseError") {
            if (showErrors)
              triggerError({
                message: `You don't have access to base
                ${data?.moveBoxesToLocation?.name}.`,
              });
            return {
              kind: IMoveBoxesResultKind.UNAUTHORIZED_FOR_BASE,
              requestedLabelIdentifiers: labelIdentifiers,
              failedLabelIdentifiers: labelIdentifiers,
            } as IMoveBoxesResult;
          }

          if (resultType === "DeletedLocationError") {
            if (showErrors)
              triggerError({
                message: `The target location has been deleted.`,
              });
            return {
              kind: IMoveBoxesResultKind.DELETED_LOCATION,
              requestedLabelIdentifiers: labelIdentifiers,
              failedLabelIdentifiers: labelIdentifiers,
            } as IMoveBoxesResult;
          }

          if (resultType === "BoxesResult") {
            const updatedBoxes = data?.moveBoxesToLocation?.updatedBoxes || [];
            const failedLabelIdentifiers =
              data?.moveBoxesToLocation?.invalidBoxLabelIdentifiers || [];

            const movedLabelIdentifiers: string[] = updatedBoxes
              .filter((box) => box.location && parseInt(box.location.id, 10) === newLocationId)
              .map((box) => box.labelIdentifier);

            if (showToasts && movedLabelIdentifiers.length > 0) {
              createToast({
                message: `${
                  movedLabelIdentifiers.length === 1
                    ? "A box was"
                    : `${movedLabelIdentifiers.length} boxes were`
                } successfully moved.`,
              });
            }

            // Not all Boxes were moved
            if (failedLabelIdentifiers.length) {
              return {
                kind: IMoveBoxesResultKind.SUCCESS_WITH_BOXES_ALREADY_AT_TARGET,
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
          }

          // Fallback for unknown result type
          return {
            kind: IMoveBoxesResultKind.FAIL,
            requestedLabelIdentifiers: labelIdentifiers,
            failedLabelIdentifiers: labelIdentifiers,
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
    [moveBoxesMutation, createToast, triggerError],
  );

  return {
    moveBoxes,
    isLoading,
  };
};
