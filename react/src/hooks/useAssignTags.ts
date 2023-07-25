import { useApolloClient } from "@apollo/client";
import { useCallback, useState } from "react";
import { generateAssignTagsRequest } from "queries/dynamic-mutations";
import { useErrorHandling } from "./useErrorHandling";
import { useNotification } from "./useNotification";

interface IAssign {
  labelIdentifier: string;
  tags: { id: string }[];
}

// // helper function to check type of dynamically created query
function isAssign(obj: any): obj is IAssign {
  return (
    typeof obj === "object" &&
    obj !== null &&
    obj !== undefined &&
    "labelIdentifier" in obj &&
    "tags" in obj &&
    Array.isArray(obj.tags) &&
    obj.tags.every((tag: any) => typeof tag === "object" && "id" in tag)
  );
}

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

      const gqlRequestPrep = generateAssignTagsRequest(labelIdentifiers, tagIds);

      // execute mutation
      return apolloClient
        .mutate({ mutation: gqlRequestPrep.gqlRequest, variables: gqlRequestPrep.variables })
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

          const successfulLabelIdentifiers: string[] = Object.values(data).reduce(
            (result: string[], response) => {
              if (isAssign(response)) {
                const typedAssign = response as IAssign;
                if (typedAssign.tags.every((tag) => tagIds.includes(parseInt(tag.id, 10)))) {
                  result.push(typedAssign.labelIdentifier);
                }
              }
              return result;
            },
            [],
          ) as string[];

          const failedLabelIdentifiers: string[] = labelIdentifiers.filter(
            (labelIdentifier) =>
              !successfulLabelIdentifiers.some(
                (successfulLabelIdentifier) => successfulLabelIdentifier === labelIdentifier,
              ),
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
