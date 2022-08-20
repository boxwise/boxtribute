import { useCallback, useMemo, useState } from "react";
import { gql, useApolloClient } from "@apollo/client";
import {
  GetBoxLabelIdentifierForQrCodeQuery,
  GetBoxLabelIdentifierForQrCodeQueryVariables,
} from "types/generated/graphql";
import QrReaderOverlay, {
  IQrValueWrapper,
  QrResolvedValue,
} from "./QrReaderOverlay";
import { GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE } from "utils/queries";

// TODO: move this out into a shared file or part of custom hook
export const extractQrCodeFromUrl = (url): string | undefined => {
  // TODO: improve the accuracy of this regex
  // TODO: consider to also handle different boxtribute environment urls
  const rx = /.*barcode=(.*)/g;
  const arr = rx.exec(url);
  return arr?.[1];
};

interface QrReaderOverlayContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanningDone: (qrValueWrappers: QrResolvedValue[]) => void;
}
const QrReaderOverlayContainer = ({
  isOpen,
  onClose,
  onScanningDone,
}: QrReaderOverlayContainerProps) => {
  const apolloClient = useApolloClient();

  const qrValueResolver = useCallback(
    (qrValueWrapper: IQrValueWrapper): Promise<IQrValueWrapper> => {
      const extractedQrCodeFromUrl = extractQrCodeFromUrl(qrValueWrapper.key);

      if (extractedQrCodeFromUrl == null) {
        // TODO: ADD PROPER ERROR MESSAGE HANDLING HERE
        const resolvedQrValueWrapper = {
          ...qrValueWrapper,
          isLoading: false,
          finalValue: { kind: "noBoxtributeQr" },
        } as IQrValueWrapper;
        console.error("Not a Boxtribute QR Code");
        return Promise.resolve(resolvedQrValueWrapper);
      }

      return apolloClient
        .query<
          GetBoxLabelIdentifierForQrCodeQuery,
          GetBoxLabelIdentifierForQrCodeQueryVariables
        >({
          query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
          variables: { qrCode: extractedQrCodeFromUrl },
          fetchPolicy: "no-cache",
        })
        .then(({ data, error, errors }) => {
          const boxLabelIdentifier = data?.qrCode?.box?.labelIdentifier;
          if (boxLabelIdentifier == null) {
            const resolvedQrValueWrapper = {
              ...qrValueWrapper,
              isLoading: false,
              finalValue: {
                kind: "notAssignedToBox",
                qrCodeValue: extractedQrCodeFromUrl,
              },
            } as IQrValueWrapper;
            console.debug("QR Code not assigned to any box yet");
            return Promise.resolve(resolvedQrValueWrapper);
          }
          const resolvedQrValueWrapper = {
            ...qrValueWrapper,
            isLoading: false,
            finalValue: {
              kind: "success",
              value: boxLabelIdentifier,
            },
          } as IQrValueWrapper;
          return resolvedQrValueWrapper;
        });
      // TODO: Handle Authorization / No Access To Box case
      // .catch((error) => {
      //   console.error(error);
      //   const resolvedQrValueWrapper = {
      //     ...qrValueWrapper,
      //     isLoading: false,
      //     finalValue: { kind: "noBoxtributeQr" },
      //   } as IQrValueWrapper;
      //   return Promise.resolve(resolvedQrValueWrapper);
      // });
    },
    [apolloClient]
  );

  const onSingleScanDone = useCallback(
    (result: string) => {
      if (!!result) {
        const qrCode = extractQrCodeFromUrl(result);
        if (qrCode == null) {
          console.error("Not a Boxtribute QR Code");
          onScanningDone([{ kind: "noBoxtributeQr" }]);
        } else {
          apolloClient
            .query<
              GetBoxLabelIdentifierForQrCodeQuery,
              GetBoxLabelIdentifierForQrCodeQueryVariables
            >({
              query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
              fetchPolicy: "no-cache",
              variables: { qrCode },
            })
            .then(({ data }) => {
              const boxLabelIdentifier = data?.qrCode?.box?.labelIdentifier;
              if (boxLabelIdentifier == null) {
                onScanningDone([
                  { kind: "notAssignedToBox", qrCodeValue: qrCode },
                ]);
                console.error("No Box yet assigned to QR Code");
              } else {
                onScanningDone([
                  { kind: "success", value: boxLabelIdentifier },
                ]);
              }
            });
        }
      }
    },
    [apolloClient, onScanningDone]
  );

  const onBulkScanningDone = useCallback(
    (qrValueWrappers: IQrValueWrapper[]) => {
      const resolvedQrValues = qrValueWrappers.map(
        // TODO: improve typings/type handling here (to get rid of the `!`)
        (qrValueWrapper) => qrValueWrapper.finalValue!
      );
      onScanningDone(resolvedQrValues);
    },
    [onScanningDone]
  );

  const [boxesByLabelSearchWrappersMap, setBoxesByLabelSearchWrappersMap] =
    useState<Map<string, IQrValueWrapper>>(new Map());

  const boxesByLabelSearchWrappers = useMemo(
    () => {
      return Array.from(boxesByLabelSearchWrappersMap.values())
      // Array.from(
      //   boxesByLabelSearchWrappersMap.keys()).map(
      //   (key) => boxesByLabelSearchWrappersMap.get(key)!
      // ),
    },
    [boxesByLabelSearchWrappersMap]
  );

  const onFindBoxByLabel = (label: string) => {
    setBoxesByLabelSearchWrappersMap((prev) => {
      if (prev.has(label)) {
        alert("already has label")
        return prev;
      }
      const newBoxByLabelSearchWrapper = {
        key: label,
        isLoading: true,
        interimValue: "loading...",
      };
      alert(label)
      return new Map(prev.set(label, newBoxByLabelSearchWrapper));
    })
  };

  // const useValidateBoxByLabelMatchingPackingListEntry = (
  // ): ValidateBoxByLabelForMatchingPackingListEntry => {
  //   const apolloClient = useApolloClient();
  //   return (boxLabel: string) => {
  //     return apolloClient
  //       .query<BoxDetailsQuery, BoxDetailsQueryVariables>({
  //         query: BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY,
  //         variables: {
  //           labelIdentifier: boxLabel,
  //         },
  //       })
  //       .then(({ data }) => {
  //         const box = data?.box;
  //         if (box != null) {
  //           if (
  //             box.product?.id === packingListEntry.product.id &&
  //             box.size.id === packingListEntry.size?.id
  //           ) {
  //             return {
  //               isValid: true,
  //               boxData: {
  //                 __typename: "Box",
  //                 labelIdentifier: boxLabel,
  //                 // ...box,
  //                 // TODO: consider to make items non-nullable in GraphQL
  //                 numberOfItems: box.items || 0,
  //               },
  //             };
  //           }
  //         }
  //         return {
  //           isValid: false,
  //           boxData: null,
  //         };
  //       });
  //   };
  // };

  return (
    <>
    {JSON.stringify(boxesByLabelSearchWrappers)}
      <QrReaderOverlay
        isBulkModeSupported={true}
        onSingleScanDone={onSingleScanDone}
        onFindBoxByLabel={onFindBoxByLabel}
        boxesByLabelSearchWrappers={boxesByLabelSearchWrappers}
        onBulkScanningDone={onBulkScanningDone}
        qrValueResolver={qrValueResolver}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
};

export default QrReaderOverlayContainer;
