import { useCallback, useState } from "react";
import { useApolloClient } from "@apollo/client";
import { BoxDetailsQuery, BoxDetailsQueryVariables } from "types/generated/graphql";
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
  box?: any;
  error?: any;
}

export const useLabelIdentifierResolver = () => {
  const [loading, setLoading] = useState(false);
  const apolloClient = useApolloClient();

  const checkLabelIdentifier = useCallback(
    async (labelIdentifier: string): Promise<ILabelIdentifierResolvedValue> => {
      setLoading(true);
      const labelIdentifierResolvedValue: ILabelIdentifierResolvedValue = await apolloClient
        .query<BoxDetailsQuery, BoxDetailsQueryVariables>({
          query: BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY,
          variables: { labelIdentifier },
          fetchPolicy: "network-only",
        })
        .then(({ data, errors }) => {
          if ((errors?.length || 0) > 0) {
            const errorCode = errors ? errors[0].extensions.code : undefined;
            if (errorCode === "FORBIDDEN") {
              return {
                kind: ILabelIdentifierResolverResultKind.NOT_AUTHORIZED,
                labelIdentifier,
              } as ILabelIdentifierResolvedValue;
            }
            if (errorCode === "BAD_USER_INPUT") {
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
            } as ILabelIdentifierResolvedValue),
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
