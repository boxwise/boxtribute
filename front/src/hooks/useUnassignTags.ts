import { CombinedGraphQLErrors } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
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
        lastModifiedOn
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
      }).then(({ data, error }) => {
        const successfulBoxes = data?.unassignTagsFromBoxes?.updatedBoxes;
        const tagErrorInfoArray = data?.unassignTagsFromBoxes?.tagErrorInfo;

        setIsLoading(false);

        // unassign fails since one ore more tags causes an error
        if (tagErrorInfoArray && tagErrorInfoArray.length > 0 && showToasts) {
          triggerError({
            message: `Could not unassign ${tagErrorInfoArray.length === 1 ? "one tag" : "multiple tags"} from boxes. Try again?`,
          });
        }

        // GraphQL error
        if (CombinedGraphQLErrors.is(error)) {
          if (showToasts) {
            triggerError({
              message: "Could not unassign tags from boxes. Try again?",
            });
          }
        } else if (error) {
          // Network error
          if (showToasts) {
            triggerError({
              message: "Network issue: Could not unassign tags from boxes. Try again?",
            });
          }
        }

        if (showToasts && successfulBoxes && successfulBoxes.length > 0) {
          createToast({
            message: `${
              successfulBoxes.length === 1 ? "A Box was" : `${successfulBoxes.length} Boxes were`
            } successfully unassigned tags.`,
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
