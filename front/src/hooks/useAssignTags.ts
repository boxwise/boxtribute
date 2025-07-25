import { useCallback, useState } from "react";
import { gql, useApolloClient } from "@apollo/client";
import { useErrorHandling } from "./useErrorHandling";
import { useNotification } from "./useNotification";

export const ASSIGN_TAGS_TO_BOXES = gql`
  mutation AssignTagsToBoxes($labelIdentifiers: [String!]!, $tagIds: [Int!]!) {
    assignTagsToBoxes(updateInput: { labelIdentifiers: $labelIdentifiers, tagIds: $tagIds }) {
      updatedBoxes {
        labelIdentifier
        tags {
          id
        }
        lastModifiedOn
      }
      invalidBoxLabelIdentifiers
    }
  }
`;

export enum IAssignTagsResultKind {
  SUCCESS = "success",
  FAIL = "fail",
  NETWORK_FAIL = "networkFail",
  BAD_USER_INPUT = "badUserInput",
  PARTIAL_FAIL = "partialFail",
}

export interface IAssignTagsResult {
  kind: IAssignTagsResultKind;
  requestedLabelIdentifiers: string[];
  successfulLabelIdentifiers?: string[];
  failedLabelIdentifiers?: string[];
  error?: any;
}

export const useAssignTags = () => {
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const apolloClient = useApolloClient();

  const assignTags = useCallback(
    async (
      labelIdentifiers: string[],
      tagIds: number[],
      showToastMessage: boolean = true,
    ): Promise<IAssignTagsResult> => {
      setIsLoading(true);

      if (labelIdentifiers.length === 0) {
        setIsLoading(false);
        return {
          kind: IAssignTagsResultKind.BAD_USER_INPUT,
          requestedLabelIdentifiers: labelIdentifiers,
        };
      }

      try {
        const { data, errors } = await apolloClient.mutate({
          mutation: ASSIGN_TAGS_TO_BOXES,
          variables: { labelIdentifiers, tagIds },
        });

        setIsLoading(false);

        if ((errors?.length || 0) > 0) {
          if (showToastMessage)
            triggerError({
              message: `Could not assign tags to ${
                labelIdentifiers.length === 1 ? "box" : "boxes"
              }. Try again?`,
            });
          return {
            kind: IAssignTagsResultKind.FAIL,
            requestedLabelIdentifiers: labelIdentifiers,
            error: errors?.[0],
          };
        }

        const assignedBoxes = data?.assignTagsToBoxes?.updatedBoxes ?? [];
        const failedLabelIdentifiers = data?.assignTagsToBoxes?.invalidBoxLabelIdentifiers ?? [];
        const successfulLabelIdentifiers: string[] = assignedBoxes.map(
          (box: any) => box.labelIdentifier,
        );

        if (showToastMessage && successfulLabelIdentifiers.length > 0) {
          createToast({
            message: `${
              successfulLabelIdentifiers.length === 1
                ? "A Box was"
                : `${successfulLabelIdentifiers.length} Boxes were`
            } successfully assigned tags.`,
          });
        }

        if (failedLabelIdentifiers.length) {
          return {
            kind: IAssignTagsResultKind.PARTIAL_FAIL,
            requestedLabelIdentifiers: labelIdentifiers,
            successfulLabelIdentifiers,
            failedLabelIdentifiers,
          };
        }

        return {
          kind: IAssignTagsResultKind.SUCCESS,
          requestedLabelIdentifiers: labelIdentifiers,
          successfulLabelIdentifiers,
        };
      } catch (err) {
        setIsLoading(false);
        if (showToastMessage)
          triggerError({
            message: `Network issue: could not assign tags to ${
              labelIdentifiers.length === 1 ? "box" : "boxes"
            }. Try again?`,
          });
        return {
          kind: IAssignTagsResultKind.NETWORK_FAIL,
          requestedLabelIdentifiers: labelIdentifiers,
          error: err,
        };
      }
    },
    [apolloClient, createToast, triggerError],
  );

  return {
    assignTags,
    isLoading,
  };
};
