import { useCallback, useState } from "react";
import { FetchPolicy, useApolloClient } from "@apollo/client";
import { GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE } from "queries/queries";
import { BOX_SCANNED_ON_FRAGMENT } from "queries/local-only";
import {
  GetBoxLabelIdentifierForQrCodeQuery,
  GetBoxLabelIdentifierForQrCodeQueryVariables,
} from "types/generated/graphql";
import { useErrorHandling } from "./useErrorHandling";

export enum IQrResolverResultKind {
  SUCCESS = "success",
  NOT_ASSIGNED_TO_BOX = "notAssignedToBox",
  NOT_AUTHORIZED = "notAuthorized",
  NOT_BOXTRIBUTE_QR = "noBoxtributeQr",
  BOX_NOT_AUTHORIZED = "boxNotAuthorized",
  BOX_NO_PERMISSION = "boxNoPermission",
  NOT_FOUND = "notFound",
  FAIL = "fail",
  // TODO: implement the following two edge cases
  DELETED_BOX = "deletedBox",
  LEGACY_BOX = "legacyBox",
}

export type IQrResolvedValue = {
  kind: IQrResolverResultKind;
  qrHash?: string;
  box?: any; // TODO: infer box type from generated type.
  error?: unknown;
}

export const extractQrCodeFromUrl = (url): string | undefined => {
  // TODO: improve the accuracy of this regex
  // TODO: consider to also handle different boxtribute environment urls
  const rx = /.*barcode=(.*)/g;
  const arr = rx.exec(url);
  // make sure there is no space arround qr code
  return arr?.[1].trim();
};

export const useQrResolver = () => {
  const { triggerError } = useErrorHandling();
  const [loading, setLoading] = useState(false);
  const apolloClient = useApolloClient();

  const resolveQrHash = useCallback(
    async (hash: string, fetchPolicy: FetchPolicy): Promise<IQrResolvedValue> => {
      setLoading(true);
      const qrResolvedValue: IQrResolvedValue = await apolloClient
        .query<GetBoxLabelIdentifierForQrCodeQuery, GetBoxLabelIdentifierForQrCodeQueryVariables>({
          query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
          variables: { qrCode: hash },
          fetchPolicy,
        })
        .then(({ data, errors }) => {
          /**
           * Payload to be handled by the `QrReaderContainer` component. 
           * 
           * Happy path with a box found will have a box attached to the payload if none of the other cases were met.
           */
          const payload: IQrResolvedValue = {
            kind: IQrResolverResultKind.FAIL,
            qrHash: hash
          };

          // Handle query error cases.
          if ((errors?.length || 0) > 0) {
            const errorCode = errors ? errors[0]?.extensions?.code : undefined;
            if (errorCode === "FORBIDDEN") {
              triggerError({
                message: "You don't have permission to access this box!",
              });
              payload.kind = IQrResolverResultKind.NOT_AUTHORIZED;
            }

            if (errorCode === "BAD_USER_INPUT") {
              triggerError({
                message: "No box found for this QR code!",
              });
              payload.kind = IQrResolverResultKind.NOT_FOUND;
            }

            triggerError({
              message: "QR code lookup failed. Please wait a bit and try again.",
            });
            payload.kind = IQrResolverResultKind.FAIL;
          }

          // Handle error cases coming from query result data.
          if (data.qrCode.__typename === "InsufficientPermissionError")
            payload.kind = IQrResolverResultKind.NOT_AUTHORIZED;

          if (data.qrCode.__typename === "ResourceDoesNotExistError")
            payload.kind = IQrResolverResultKind.NOT_FOUND;

          if (data.qrCode.__typename === "QrCode") {
            // Handle valid QR code with no Box assigned.
            if (!data.qrCode.box)
              payload.kind = IQrResolverResultKind.NOT_ASSIGNED_TO_BOX;

            // Handle valid not owned Box cases.
            if (data.qrCode.box?.__typename === "InsufficientPermissionError")
              payload.kind = IQrResolverResultKind.BOX_NO_PERMISSION;

            if (data.qrCode.box?.__typename === "UnauthorizedForBaseError")
              payload.kind = IQrResolverResultKind.BOX_NOT_AUTHORIZED;

            // Handle valid Box cases.
            payload.kind = IQrResolverResultKind.SUCCESS;
            payload.box = data.qrCode.box;
          }

          // Unlikely to happen, but just in case.
          if (payload.kind === IQrResolverResultKind.FAIL) throw new Error("GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE resolved with an invalid type.");

          return payload;
        })
        .catch((err) => {
          triggerError({
            message: "QR code lookup failed. Please wait a bit and try again.",
          });

          return {
            kind: IQrResolverResultKind.FAIL,
            qrHash: hash,
            error: err,
          } as IQrResolvedValue;
        });

      if (qrResolvedValue.kind === IQrResolverResultKind.SUCCESS) {
        const boxCacheRef = `Box:{"labelIdentifier":"${qrResolvedValue.box.labelIdentifier}"}`;
        // add a scannedOn parameter in the cache if Box was scanned
        apolloClient.writeFragment({
          id: boxCacheRef,
          fragment: BOX_SCANNED_ON_FRAGMENT,
          data: {
            scannedOn: new Date(),
          },
        });
      }
      setLoading(false);
      return qrResolvedValue;
    },
    [apolloClient, triggerError],
  );

  const resolveQrCode = useCallback(
    async (qrCodeUrl: string, fetchPolicy: FetchPolicy): Promise<IQrResolvedValue> => {
      setLoading(true);
      const extractedQrHashFromUrl = extractQrCodeFromUrl(qrCodeUrl);
      if (extractedQrHashFromUrl == null) {
        triggerError({
          message: "This is not a Boxtribute QR code!",
        });
        setLoading(false);
        return { kind: IQrResolverResultKind.NOT_BOXTRIBUTE_QR } as IQrResolvedValue;
      }
      const qrResolvedValue: IQrResolvedValue = await resolveQrHash(
        extractedQrHashFromUrl,
        fetchPolicy,
      );
      setLoading(false);
      return qrResolvedValue;
    },
    [resolveQrHash, triggerError],
  );

  return {
    loading,
    resolveQrHash,
    resolveQrCode,
  };
};
