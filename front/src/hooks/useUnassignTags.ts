import { useMutation } from "@apollo/client";
import { graphql } from "../../../graphql/graphql";
import { useCallback, useState } from "react";
import { useErrorHandling } from "./useErrorHandling";

export enum IUnassignTagsResultKind {
  SUCCESS = "success",
  FAIL = "fail",
  NETWORK_FAIL = "networkFail",
  BAD_USER_INPUT = "badUserInput", // no Boxes were pased to the function
  INVALID_IDENTIFIERS = "invalidIdentifiers",
}

export interface IUnassignTagsResult {
  kind: IUnassignTagsResultKind;
  requestedLabelIdentifiers: string[];
  requestedTagIds: number[];
  // TODO: Might not need
  // successfulLabelIdentifiers?: string[];
  // invalidIdentifiers?: string[];
  error?: any;
}

/**
 * 
 * @returns 
 * {
  "data": {
    "unassignTagsFromBoxes": {
      "invalidBoxLabelIdentifiers": [
        "123"
      ],
      "tagErrorInfo": [],
      "updatedBoxes": []
    }
  }
}
 */

export const UNASSIGN_TAGS_FROM_BOXES = graphql(`
  mutation UnassignTagsFromBoxes($labelIdentifiers: [String!]!, $tagIds: [Int!]!) {
    unassignTagsFromBoxes(updateInput: { labelIdentifiers: $labelIdentifiers, tagIds: $tagIds }) {
      updatedBoxes {
        labelIdentifier
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
            return {
              kind: IUnassignTagsResultKind.FAIL,
              error: errors[0],
            } as IUnassignTagsResult;
          }

          const tagErrorInfoArray = data?.unassignTagsFromBoxes?.tagErrorInfo;

          if (tagErrorInfoArray && tagErrorInfoArray.length > 0) {
            if (showToasts) {
              triggerError({
                message: "Errors in tags unassignment",
              });
            }
            return {
              kind: IUnassignTagsResultKind.INVALID_IDENTIFIERS,
            } as IUnassignTagsResult;
          }

          return {
            kind: IUnassignTagsResultKind.FAIL,
          } as IUnassignTagsResult;
        })
        .catch((err) => {
          setIsLoading(false);
          if (showToasts) {
            triggerError({
              message: "Could not unassign boxes. Try again?",
            });
          }
          return {
            kind: IUnassignTagsResultKind.NETWORK_FAIL,
            requestedLabelIdentifiers: labelIdentifiers,
            requestedTagIds: tagIds,
            error: err,
          } as IUnassignTagsResult;
        });
    },
    [unassignTagsMutation, triggerError],
  );

  return {
    unassignTags,
    isLoading,
  };
};
