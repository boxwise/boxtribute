import { useCallback, useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { Box } from "queries/types";
import { BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY } from "queries/queries";

export enum ILabelIdentifierResolverResultKind {
  SUCCESS = "success",
  FAIL = "fail",
  NOT_FOUND = "notFound",
  NOT_AUTHORIZED = "notAuthorized",
  // TODO: implement the following two edge cases
  DELETED_BOX = "deletedBox",
  LEGACY_BOX = "legacyBox",
}

export interface ILabelIdentifierResolvedValue {
  kind: ILabelIdentifierResolverResultKind;
  labelIdentifier?: string;
  box?: Partial<Box>;
  error?: any;
}

export const useLabelIdentifierResolver = () => {
  const [loading, setLoading] = useState(false);
  const apolloClient = useApolloClient();

  const checkLabelIdentifier = useCallback(
    async (labelIdentifier: string): Promise<ILabelIdentifierResolvedValue> => {
      setLoading(true);
      const labelIdentifierResolvedValue: ILabelIdentifierResolvedValue = await apolloClient
        .query({
          query: BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY,
          variables: { labelIdentifier },
          fetchPolicy: "network-only",
        })
        .then(({ data, error }) => {
          if (error) {
            const errorMessage = error.message || "";
            if (errorMessage.includes("FORBIDDEN")) {
              return {
                kind: ILabelIdentifierResolverResultKind.NOT_AUTHORIZED,
                labelIdentifier,
              } as ILabelIdentifierResolvedValue;
            }
            if (errorMessage.includes("BAD_USER_INPUT")) {
              return {
                kind: ILabelIdentifierResolverResultKind.NOT_FOUND,
                labelIdentifier,
              } as ILabelIdentifierResolvedValue;
            }
            return {
              kind: ILabelIdentifierResolverResultKind.FAIL,
              labelIdentifier,
            } as ILabelIdentifierResolvedValue;
          }
          return {
            kind: ILabelIdentifierResolverResultKind.SUCCESS,
            box: data?.box,
          } as ILabelIdentifierResolvedValue;
        })
        .catch(
          (err) =>
            ({
              kind: ILabelIdentifierResolverResultKind.FAIL,
              labelIdentifier,
              error: err,
            }) as ILabelIdentifierResolvedValue,
        );
      setLoading(false);
      return labelIdentifierResolvedValue;
    },
    [apolloClient],
  );

  return {
    loading,
    checkLabelIdentifier,
  };
};
