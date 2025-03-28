import { useMutation } from "@apollo/client";
import { graphql } from "../../../graphql/graphql";
import { useCallback, useState } from "react";
import { useErrorHandling } from "./useErrorHandling";
import { useNotification } from "./useNotification";

export const UNASSIGN_TAGS_FROM_BOXES = graphql(`
  mutation UnassignTagsFromBoxes($labelIdentifiers: [String!]!, $tagIds: [Int!]!) {
    unassignTagsFromBoxes(updateInput: { labelIdentifiers: $labelIdentifiers, tagIds: $tagIds }) {
      updatedBoxes {
        labelIdentifier
        tags {
          id
        }
      }
      invalidBoxLabelIdentifiers
      tagErrorInfo {
        id
        error {
          __typename
        }
      }
    }
  }
`);

export const useUnassignTags = () => {
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [unassignTagsMutation] = useMutation(UNASSIGN_TAGS_FROM_BOXES);

  const unassignTags = useCallback(
    (labelIdentifiers: string[], tagIds: number[], showToasts: boolean = true) => {
      setIsLoading(true);

      return unassignTagsMutation({
        variables: {
          labelIdentifiers,
          tagIds,
        },
      })
        .then(({ data, errors }) => {
          setIsLoading(false);

          if (errors?.length) {
            if (showToasts) {
              triggerError({
                message: "Could not unassign boxes. Try again?",
              });
            }
          }

          const tagErrorInfoArray = data?.unassignTagsFromBoxes?.tagErrorInfo;
          const invalidBoxLabelIdentifiers =
            data?.unassignTagsFromBoxes?.invalidBoxLabelIdentifiers;

          if (invalidBoxLabelIdentifiers && invalidBoxLabelIdentifiers.length > 0) {
            if (showToasts) {
              createToast({
                type: "warning",
                message: `Box(s) ${invalidBoxLabelIdentifiers} not affected because it/they don't have the requested tag(s) assigned.`,
              });
            }
          }

          if (tagErrorInfoArray && tagErrorInfoArray.length > 0) {
            if (showToasts) {
              triggerError({
                message:
                  "Error: Tag(s) can't be removed because they are either deleted, a wrong type, or in a different base",
              });
            }
          }
        })
        .catch((err) => {
          setIsLoading(false);
          if (showToasts) {
            triggerError({
              message: err + "Could not unassign tags from boxes. Try again?",
            });
          }
        });
    },
    [unassignTagsMutation, triggerError, createToast],
  );

  return {
    unassignTags,
    isLoading,
  };
};
