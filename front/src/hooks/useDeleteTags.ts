import { useMutation } from "@apollo/client";
import { graphql } from "../../../graphql/graphql";
import { useCallback, useState } from "react";
import { useErrorHandling } from "./useErrorHandling";
import { useNotification } from "./useNotification";

export enum IDeleteTagResultKind {
  SUCCESS = "success",
  FAIL = "fail",
  NETWORK_FAIL = "networkFail",
  NOT_AUTHORIZED = "notAuthorized",
  INVALID_IDENTIFIERS = "invalidIdentifiers",
}

type DeletedTag = {
  id: string;
  name: string;
  deletedOn: string;
};

export interface IDeleteTagResult {
  requestedTagIds?: number[];
  updatedTags?: DeletedTag[];
  invalidTagIds?: string[];
  error?: any;
}

export const DELETE_TAGS = graphql(`
  mutation deleteTags($ids: [Int!]!) {
    deleteTags(ids: $ids) {
      __typename
      ... on TagsResult {
        updatedTags {
          id
          name
          deletedOn
        }
        invalidTagIds
      }
      ... on InsufficientPermissionError {
        name
      }
    }
  }
`);

export const useDeleteTags = () => {
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [deleteTagsMutation] = useMutation(DELETE_TAGS);

  const deleteTags = useCallback(
    (tagIds: number[], showToasts: boolean = true, showErrors: boolean = true) => {
      setIsLoading(true);

      return deleteTagsMutation({
        variables: {
          ids: tagIds,
        },
      })
        .then(({ data, errors }) => {
          setIsLoading(false);

          if (errors?.length) {
            if (showErrors) {
              triggerError({
                message: "Could not delete tags. Try again?",
              });
            }
            return {
              kind: IDeleteTagResultKind.FAIL,
              requestedTagIds: tagIds,
              error: errors[0],
            } as IDeleteTagResult;
          }

          const resultType = data?.deleteTags?.__typename;
          if (resultType === "InsufficientPermissionError") {
            if (showErrors) {
              triggerError({
                message: "You don't have the permissions to delete these tags.",
              });
            }
            return {
              kind: IDeleteTagResultKind.NOT_AUTHORIZED,
              requestedTagIds: tagIds,
            } as IDeleteTagResult;
          }

          if (resultType === "TagsResult") {
            const deletedTags = data?.deleteTags?.updatedTags || [];
            const invalidTagIds = data?.deleteTags?.invalidTagIds || [];

            if (deletedTags.length && showToasts) {
              createToast({
                message: `${deletedTags.length === 1 ? "A tag was" : `${deletedTags.length} tags were`} successfully deleted.`,
              });
            }

            if (invalidTagIds.length) {
              if (showErrors) {
                triggerError({
                  message: `The deletion failed for tag IDs: ${invalidTagIds.join(", ")}`,
                });
              }
              if (invalidTagIds.length === tagIds.length) {
                return {
                  kind: IDeleteTagResultKind.FAIL,
                  requestedTagIds: tagIds,
                  invalidTagIds,
                } as IDeleteTagResult;
              }
            }

            return {
              kind: IDeleteTagResultKind.SUCCESS,
              requestedTagIds: tagIds,
              updatedTags: deletedTags,
              invalidTagIds,
            } as IDeleteTagResult;
          }

          return {
            kind: IDeleteTagResultKind.FAIL,
            requestedTagIds: tagIds,
          } as IDeleteTagResult;
        })
        .catch((err) => {
          setIsLoading(false);
          if (showErrors) {
            triggerError({
              message: "Could not delete tags. Try again?",
            });
          }
          return {
            kind: IDeleteTagResultKind.NETWORK_FAIL,
            requestedTagIds: tagIds,
            error: err,
          } as IDeleteTagResult;
        });
    },
    [deleteTagsMutation, createToast, triggerError],
  );

  return {
    deleteTags,
    isLoading,
  };
};
