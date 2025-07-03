import { useMutation } from "@apollo/client";
import { graphql } from "../../../graphql/graphql";
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

type DeletedBoxes = {
  labelIdentifier: string;
  deletedOn: string;
};

export interface IDeleteBoxResult {
  kind: IDeleteBoxResultKind;
  requestedBoxes: IBoxBasicFields[];
  deletedBoxes?: DeletedBoxes[];
  invalidIdentifiers?: string[];
  error?: any;
}

export const DELETE_BOXES = graphql(`
  mutation DeleteBoxes($labelIdentifiers: [String!]!) {
    deleteBoxes(labelIdentifiers: $labelIdentifiers) {
      __typename
      ... on BoxesResult {
        updatedBoxes {
          labelIdentifier
          deletedOn
          product {
            id
            instockItemsCount
            transferItemsCount
          }
        }
        invalidBoxLabelIdentifiers
      }
      ... on InsufficientPermissionError {
        name
      }
    }
  }
`);

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

          const resultType = data?.deleteBoxes?.__typename;
          if (resultType === "InsufficientPermissionError") {
            if (showErrors) {
              triggerError({
                message: "You don't have the permissions to delete these boxes.",
              });
            }
            return {
              kind: IDeleteBoxResultKind.NOT_AUTHORIZED,
              requestedBoxes: boxes,
            } as IDeleteBoxResult;
          }

          if (resultType === "BoxesResult") {
            const deletedBoxes = data?.deleteBoxes?.updatedBoxes || [];
            const invalidIdentifiers = data?.deleteBoxes?.invalidBoxLabelIdentifiers || [];

            if (deletedBoxes.length && showToasts) {
              createToast({
                message: `${deletedBoxes.length === 1 ? "A box was" : `${deletedBoxes.length} boxes were`} successfully deleted.`,
              });
            }

            if (invalidIdentifiers.length) {
              if (showErrors) {
                triggerError({
                  message: `The deletion failed for: ${invalidIdentifiers.join(", ")}`,
                });
              }
              if (invalidIdentifiers.length === labelIdentifiers.length) {
                return {
                  kind: IDeleteBoxResultKind.FAIL,
                  requestedBoxes: boxes,
                  invalidIdentifiers,
                } as IDeleteBoxResult;
              }
            }

            return {
              kind: IDeleteBoxResultKind.SUCCESS,
              requestedBoxes: boxes,
              deletedBoxes,
              invalidIdentifiers,
            } as IDeleteBoxResult;
          }

          return {
            kind: IDeleteBoxResultKind.FAIL,
            requestedBoxes: boxes,
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
