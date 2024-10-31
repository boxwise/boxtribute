import { gql, useMutation } from "@apollo/client";
import { useCallback, useState } from "react";
import { IBoxBasicFields } from "types/graphql-local-only";
import { useErrorHandling } from "./useErrorHandling";
import { useNotification } from "./useNotification";

export enum IDeleteBoxResultKind {
  SUCCESS = "success",
  FAIL = "fail",
  NETWORK_FAIL = "networkFail",
  NOT_AUTHORIZED = "notAuthorized",
  INVALID_IDENTIFIERS = "invalidIdentifiers",
}

export interface IDeleteBoxResult {
  kind: IDeleteBoxResultKind;
  requestedBoxes: IBoxBasicFields[];
  deletedBoxes?: IBoxBasicFields[];
  invalidIdentifiers?: string[];
  error?: any;
}

export const DELETE_BOXES = gql`
  mutation DeleteBoxes($labelIdentifiers: [String!]!) {
    deleteBoxes(labelIdentifiers: $labelIdentifiers) {
      __typename
      ... on BoxResult {
        invalidBoxLabelIdentifiers
      }
      ... on InsufficientPermissionError {
        name
      }
    }
  }
`;

export const useDeleteBoxes = () => {
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [deleteBoxesMutation] = useMutation(DELETE_BOXES);

  const deleteBoxes = useCallback(
    (boxes: IBoxBasicFields[], showToasts: boolean = true, showErrors: boolean = true) => {
      setIsLoading(true);
      const labelIdentifiers = boxes.map((box) => box.labelIdentifier);

      return deleteBoxesMutation({
        variables: {
          labelIdentifiers,
        },
      })
        .then(({ data, errors }) => {
          setIsLoading(false);

          if (errors?.length) {
            const errorCode = errors[0]?.extensions?.code;

            if (errorCode === "InsufficientPermissionError") {
              if (showErrors) {
                triggerError({
                  message: "You don't have the permissions to delete these boxes.",
                });
              }
              return {
                kind: IDeleteBoxResultKind.NOT_AUTHORIZED,
                requestedBoxes: boxes,
                error: errors[0],
              } as IDeleteBoxResult;
            }

            if (showErrors) {
              triggerError({
                message: "Could not delete boxes. Try again?",
              });
            }
            return {
              kind: IDeleteBoxResultKind.FAIL,
              requestedBoxes: boxes,
              error: errors[0],
            } as IDeleteBoxResult;
          }

          const deletedBoxes = data?.deleteBoxes?.updatedBoxes || [];
          const invalidIdentifiers = data?.deleteBoxes?.invalidBoxLabelIdentifiers || [];

          if (deletedBoxes.length) {
            if (showToasts) {
              createToast({
                message: `${deletedBoxes.length === 1 ? "A box was" : `${deletedBoxes.length} boxes were`} successfully deleted.`,
              });
            }
          }

          if (invalidIdentifiers.length) {
            if (showErrors) {
              triggerError({
                message: `Invalid box identifiers: ${invalidIdentifiers.join(", ")}`,
              });
            }
          }

          return {
            kind: IDeleteBoxResultKind.SUCCESS,
            requestedBoxes: boxes,
            deletedBoxes,
            invalidIdentifiers,
          } as IDeleteBoxResult;
        })
        .catch((err) => {
          setIsLoading(false);
          if (showErrors) {
            triggerError({
              message: "Could not delete boxes. Try again?",
            });
          }
          return {
            kind: IDeleteBoxResultKind.NETWORK_FAIL,
            requestedBoxes: boxes,
            error: err,
          } as IDeleteBoxResult;
        });
    },
    [deleteBoxesMutation, createToast, triggerError],
  );

  return {
    deleteBoxes,
    isLoading,
  };
};
