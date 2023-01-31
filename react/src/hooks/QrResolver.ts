import { useCallback } from "react";
import { useBoolean } from "@chakra-ui/react";
import { extractQrCodeFromUrl } from "utils/helpers";
import { useApolloClient } from "@apollo/client";
import { GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE } from "queries/queries";
import {
  GetBoxLabelIdentifierForQrCodeQuery,
  GetBoxLabelIdentifierForQrCodeQueryVariables,
} from "types/generated/graphql";

export enum QrResolverResultKind {
  SUCCESS = "success",
  FAIL = "fail",
  NOT_ASSIGNED_TO_BOX = "notAssignedToBox",
  LABEL_NOT_FOUND = "labelNotFound",
  NOT_AUTHORIZED = "notAuthorized",
  NOT_BOXTRIBUTE_QR = "noBoxtributeQr",
}

export interface IQrResolvedValue {
  kind: QrResolverResultKind;
  qrCodeValue?: string;
  value?: any;
  error?: any;
}

export const useQrResolver = () => {
  const apolloClient = useApolloClient();
  const [isLoading, setIsLoading] = useBoolean(false);

  const checkQrHash = useCallback(
    (hash: string) => {
      setIsLoading.on();
      apolloClient
        .query<GetBoxLabelIdentifierForQrCodeQuery, GetBoxLabelIdentifierForQrCodeQueryVariables>({
          query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
          variables: { qrCode: hash },
          fetchPolicy: "no-cache",
        })
        .then(({ data, errors }) => {
          if ((errors?.length || 0) > 0) {
            const errorCode = errors ? errors[0].extensions.code : undefined;
            if (errorCode === "FORBIDDEN") {
              return {
                kind: QrResolverResultKind.NOT_AUTHORIZED,
                qrCodeValue: hash,
              } as IQrResolvedValue;
            }
            if (errorCode === "BAD_USER_INPUT") {
              return {
                kind: QrResolverResultKind.NOT_BOXTRIBUTE_QR,
                qrCodeValue: hash,
              } as IQrResolvedValue;
            }
            return { kind: QrResolverResultKind.FAIL, qrCodeValue: hash } as IQrResolvedValue;
          }
          if (data?.qrCode?.box == null) {
            return {
              kind: QrResolverResultKind.NOT_ASSIGNED_TO_BOX,
              qrCodeValue: hash,
            } as IQrResolvedValue;
          }
          return {
            kind: QrResolverResultKind.SUCCESS,
            value: data?.qrCode?.box,
          } as IQrResolvedValue;
        })
        .catch(
          (err) =>
            ({
              kind: QrResolverResultKind.FAIL,
              qrCodeValue: hash,
              error: err,
            } as IQrResolvedValue),
        );
    },
    [apolloClient, setIsLoading],
  );

  const checkQrCode = useCallback(
    (qrCodeUrl: string) => {
      setIsLoading.on();
      const extractedQrHashFromUrl = extractQrCodeFromUrl(qrCodeUrl);
      if (extractedQrHashFromUrl == null) {
        setIsLoading.off();
        return { kind: QrResolverResultKind.NOT_BOXTRIBUTE_QR } as IQrResolvedValue;
      }
      return checkQrHash(extractedQrHashFromUrl);
    },
    [setIsLoading, checkQrHash],
  );

  return {
    isLoading,
    checkQrHash,
    checkQrCode,
  };
};
