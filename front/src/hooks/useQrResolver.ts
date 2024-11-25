import { useCallback, useState } from "react";
import { FetchPolicy, useApolloClient } from "@apollo/client";
import { GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE } from "queries/queries";
import { BOX_SCANNED_ON_FRAGMENT } from "queries/local-only";
import { useErrorHandling } from "./useErrorHandling";

export enum IQrResolverResultKind {
  SUCCESS = "success",
  NOT_ASSIGNED_TO_BOX = "notAssignedToBox",
  NO_BOXTRIBUTE_QR = "noBoxtributeQr",
  NOT_AUTHORIZED_FOR_QR = "notAuthorizedForQr",
  NOT_AUTHORIZED_FOR_BASE = "notAuthorizedForBase",
  NOT_AUTHORIZED_FOR_BOX = "notAuthorizedForBox",
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
};

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

  /**
   * @todo refactor function to be less repetitive.
   */
  const resolveQrHash = useCallback(
    async (hash: string, fetchPolicy: FetchPolicy): Promise<IQrResolvedValue> => {
      setLoading(true);
      const qrResolvedValue: IQrResolvedValue = await apolloClient
        .query({
          query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
          variables: { qrCode: hash },
          fetchPolicy,
        })
        .then(({ data, errors }) => {
          if (errors?.length) {
            // Likely an unexpected graphQL error.
            triggerError({
              message: "QR code lookup failed. Please wait a bit and try again.",
            });

            return {
              kind: IQrResolverResultKind.FAIL,
              qrHash: hash,
            } as IQrResolvedValue;
          }

          if (data.qrCode.__typename === "ResourceDoesNotExistError") {
            // Qr code does not exit in the DB
            triggerError({
              message: "This is not a Boxtribute QR code!",
            });
            return {
              kind: IQrResolverResultKind.NO_BOXTRIBUTE_QR,
              qrHash: hash,
            } as IQrResolvedValue;
          } else if (data.qrCode.__typename === "InsufficientPermissionError") {
            // missing qr:read RBP
            triggerError({
              message: `You don't have permission to access this QR-code!`,
            });
            return {
              kind: IQrResolverResultKind.NOT_AUTHORIZED_FOR_QR,
              qrHash: hash,
            } as IQrResolvedValue;
          } else if (data.qrCode.__typename === "QrCode") {
            // qr code exists in the DB
            if (!data?.qrCode?.box) {
              // no box associated to this qr code
              return {
                kind: IQrResolverResultKind.NOT_ASSIGNED_TO_BOX,
                qrHash: hash,
              } as IQrResolvedValue;
            } else if (data.qrCode.box?.__typename === "InsufficientPermissionError") {
              // missing stock:read RBP
              triggerError({
                message: `You don't have permission to access this box!`,
              });
              return {
                kind: IQrResolverResultKind.NOT_AUTHORIZED_FOR_BOX,
                qrHash: hash,
                box: data?.qrCode?.box,
              } as IQrResolvedValue;
            } else if (data.qrCode.box?.__typename === "UnauthorizedForBaseError") {
              // box is in another base
              return {
                kind: IQrResolverResultKind.NOT_AUTHORIZED_FOR_BASE,
                qrHash: hash,
                box: data?.qrCode?.box,
              } as IQrResolvedValue;
            }
            // a box is found for the QR code
            return {
              kind: IQrResolverResultKind.SUCCESS,
              qrHash: hash,
              box: data?.qrCode?.box,
            } as IQrResolvedValue;
          }

          throw new Error("Invalid Query Result.");
        })
        .catch((err) => {
          // Likely an unexpected network error.
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

      if (!extractedQrHashFromUrl) {
        triggerError({
          message: "This is not a Boxtribute QR code!",
        });

        setLoading(false);
        return { kind: IQrResolverResultKind.NO_BOXTRIBUTE_QR } as IQrResolvedValue;
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
