import { gql, useApolloClient } from "@apollo/client";
import { useCallback, useState } from "react";
import { useErrorHandling } from "./useErrorHandling";
import { useNotification } from "./useNotification";

export enum IAssignTagsResultKind {
  SUCCESS = "success",
  FAIL = "fail",
  NETWORK_FAIL = "networkFail",
  BAD_USER_INPUT = "badUserInput", // no Boxes were pased to the function
  PARTIAL_FAIL = "partailFail", // Some Boxes where moved and some not
}

export interface IAssignTagsResult {
  kind: IAssignTagsResultKind;
  requestedLabelIdentifiers: string[];
  successfulLabelIdentifiers?: string[];
  failedLabelIdentifiers?: string[];
  error?: any;
}

export const ASSIGN_TAGS_TO_BOXES_MUTATION = gql`
  mutation AssignTagsToBoxes($labelIdentifiers: [String!]!, $tagIds: [Int!]!) {
    assignTagsToBoxes(updateInput: { labelIdentifiers: $labelIdentifiers, tagIds: $tagIds }) {
      updatedBoxes {
        labelIdentifier
      }
      invalidBoxLabelIdentifiers
    }
  }
`;

export const useAssignTags = () => {
  const { triggerError } = useErrorHandling();
  const { createToast } = useNotification();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const apolloClient = useApolloClient();

  const assignTags = useCallback(
    (labelIdentifiers: string[], tagIds: number[], showToastMessage: boolean = true) => {
      setIsLoading(true);

      // no Boxes were passed
      if (labelIdentifiers.length === 0) {
        setIsLoading(false);
        return {
          kind: IAssignTagsResultKind.BAD_USER_INPUT,
          requestedLabelIdentifiers: labelIdentifiers,
        } as IAssignTagsResult;
      }

      // execute mutation
      return apolloClient
        .mutate({
          mutation: ASSIGN_TAGS_TO_BOXES_MUTATION,
          variables: { labelIdentifiers, tagIds },
        })
        .then(({ data, errors }) => {
          setIsLoading(false);
          if ((errors?.length || 0) > 0) {
            // General error
            if (showToastMessage)
              triggerError({
                message: `Could not assign tags to ${
                  labelIdentifiers.length === 1 ? "box" : "boxes"
                }. Try again?`,
              });

            return {
              kind: IAssignTagsResultKind.FAIL,
              requestedLabelIdentifiers: labelIdentifiers,
              error: errors ? errors[0] : undefined,
            } as IAssignTagsResult;
          }

          const { updatedBoxes, invalidBoxLabelIdentifiers } = data.assignTagsToBoxes;
          const successfulLabelIdentifiers = updatedBoxes.map((box) => box.labelIdentifier);
          const failedLabelIdentifiers = invalidBoxLabelIdentifiers;

          if (showToastMessage && successfulLabelIdentifiers.length > 0) {
            createToast({
              message: `${
                successfulLabelIdentifiers.length === 1
                  ? "A Box was"
                  : `${successfulLabelIdentifiers.length} Boxes were`
              } successfully assigned tags.`,
            });
          }

          // Not all Boxes were moved
          if (failedLabelIdentifiers.length) {
            return {
              kind: IAssignTagsResultKind.PARTIAL_FAIL,
              requestedLabelIdentifiers: labelIdentifiers,
              successfulLabelIdentifiers,
              failedLabelIdentifiers,
            } as IAssignTagsResult;
          }

          // All Boxes were moved
          return {
            kind: IAssignTagsResultKind.SUCCESS,
            requestedLabelIdentifiers: labelIdentifiers,
            successfulLabelIdentifiers,
          } as IAssignTagsResult;
        })
        .catch(
          // Network error
          (err) => {
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
            } as IAssignTagsResult;
          },
        );
    },
    [apolloClient, createToast, triggerError],
  );

  return {
    assignTags,
    isLoading,
  };
};
