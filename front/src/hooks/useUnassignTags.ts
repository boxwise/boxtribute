import { useMutation } from "@apollo/client";
import { graphql } from "../../../graphql/graphql";
import { useCallback, useState } from "react";
import { useErrorHandling } from "./useErrorHandling";

export enum IUnassignTagsResultKind {
  SUCCESS = "success",
  FAIL = "fail",
  NETWORK_FAIL = "networkFail",
  BAD_USER_INPUT = "badUserInput",
  INVALID_IDENTIFIERS = "invalidIdentifiers",
  INVALID_TAGS = "invalidaTags",
}

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
              invalidBoxLabelIdentifiers.map((identifier) => {
                triggerError({
                  message: `Box ${identifier} not affected because it doesn't have the requested tag(s) assigned.`,
                });
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
    [unassignTagsMutation, triggerError],
  );

  return {
    unassignTags,
    isLoading,
  };
};
