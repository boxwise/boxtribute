import { useMutation } from "@apollo/client";
import { graphql } from "../../../graphql/graphql";
import { useCallback, useState } from "react";
import { useErrorHandling } from "./useErrorHandling";

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
        .then(({ errors }) => {
          setIsLoading(false);

          if (errors?.length) {
            if (showToasts) {
              triggerError({
                message: "Could not unassign boxes. Try again?",
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
    [unassignTagsMutation, triggerError],
  );

  return {
    unassignTags,
    isLoading,
  };
};
