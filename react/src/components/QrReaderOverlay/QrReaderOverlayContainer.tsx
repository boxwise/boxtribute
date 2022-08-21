import { useCallback, useMemo, useState } from "react";
import { gql, useApolloClient } from "@apollo/client";
import {
  BoxDetailsQuery,
  BoxDetailsQueryVariables,
  GetBoxLabelIdentifierForQrCodeQuery,
  GetBoxLabelIdentifierForQrCodeQueryVariables,
} from "types/generated/graphql";
import QrReaderOverlay, {
  IQrValueWrapper,
  QrResolvedValue,
} from "./QrReaderOverlay";
import {
  BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY,
  GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
} from "utils/queries";
import { IBoxDetailsData } from "utils/base-types";
import { useBoolean } from "@chakra-ui/react";

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
  const isBulkModeSupported = true;

  const apolloClient = useApolloClient();

  const addQrValueWrapperToMap = useCallback(
    (qrValueWrapper: IQrValueWrapper) => {
      setScannedQrValueWrappersMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(qrValueWrapper.key, qrValueWrapper);
        return newMap;
      });
    },
    []
  );

  const qrValueResolver = useCallback(
    (qrValueWrapper: IQrValueWrapper): void => {
      const extractedQrCodeFromUrl = extractQrCodeFromUrl(qrValueWrapper.key);

      if (extractedQrCodeFromUrl == null) {
        // TODO: ADD PROPER ERROR MESSAGE HANDLING HERE
        const resolvedQrValueWrapper = {
          ...qrValueWrapper,
          isLoading: false,
          finalValue: { kind: "noBoxtributeQr" },
        } as IQrValueWrapper;
        console.error("Not a Boxtribute QR Code");
        addQrValueWrapperToMap(resolvedQrValueWrapper);
      } else {
        apolloClient
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
              addQrValueWrapperToMap(resolvedQrValueWrapper);
            }
            const resolvedQrValueWrapper = {
              ...qrValueWrapper,
              isLoading: false,
              finalValue: {
                kind: "success",
                value: {
                  labelIdentifier: boxLabelIdentifier,
                  product: data?.qrCode?.box?.product,
                  size: data?.qrCode?.box?.size,
                  // TODO: do better validation and error handling here
                  numberOfItems: data?.qrCode?.box?.items || 0,
                },
              },
            } as IQrValueWrapper;
            addQrValueWrapperToMap(resolvedQrValueWrapper);
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
      }
    },
    [addQrValueWrapperToMap, apolloClient]
  );

  const handleSingleScan = useCallback(
    (result: string) => {
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
                  {
                    kind: "success",
                    value: {
                      labelIdentifier: boxLabelIdentifier,
                      product: data?.qrCode?.box?.product,
                      size: data?.qrCode?.box?.size,
                      numberOfItems: data?.qrCode?.box?.items || 0,
                    } as IBoxDetailsData,
                  },
                ]);
              }
            });
        }
    },
    [apolloClient, onScanningDone]
  );

  const [isBulkModeActive, setIsBulkModeActive] = useBoolean(false);

  const [scannedQrValueWrappersMap, setScannedQrValueWrappersMap] = useState<
    Map<string, IQrValueWrapper>
  >(new Map());

  // We are using IQrValueWrapper also for the Find Boxes By Label use case
  // since they are structurally very similar.
  // The naming of the type could be made more general though.
  // Or we indeed want to have two seperate types in case they semantically differ at some point.
  const [boxesByLabelSearchWrappersMap, setBoxesByLabelSearchWrappersMap] =
    useState<Map<string, IQrValueWrapper>>(new Map());

  const boxesByLabelSearchWrappers = useMemo(() => {
    return Array.from(boxesByLabelSearchWrappersMap.values());
    // Array.from(
    //   boxesByLabelSearchWrappersMap.keys()).map(
    //   (key) => boxesByLabelSearchWrappersMap.get(key)!
    // ),
  }, [boxesByLabelSearchWrappersMap]);

  const scannedQrValueWrappers = useMemo(
    () =>
      Array.from(scannedQrValueWrappersMap.keys()).map(
        (key) => scannedQrValueWrappersMap.get(key)!
      ),
    [scannedQrValueWrappersMap]
  );

  const resetState = useCallback(() => {
    setScannedQrValueWrappersMap(() => new Map());
    setBoxesByLabelSearchWrappersMap(() => new Map());
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const onBulkScanningDone = useCallback(() => {
    // const resolvedQrValues = Array.from(scannedQrValueWrappersMap.values()).filter(
    //   (qrValueWrapper) => qrValueWrapper.finalValue?.kind !== "noBoxtributeQr"
    // );
    handleClose();
    const resolvedQrValues = scannedQrValueWrappers
      .filter(
        (qrValueWrapper) => qrValueWrapper.finalValue?.kind !== "noBoxtributeQr"
      )
      .map(
        // TODO: improve typings/type handling here (to get rid of the `!`)
        (qrValueWrapper) => qrValueWrapper.finalValue!
      );
    onScanningDone(resolvedQrValues);
  }, [handleClose, onScanningDone, scannedQrValueWrappers]);

  // TODO: consider to lift the state for the qr values up to the container
  // and to get rid of passing in the qr value resolver callback/promise
  const addQrValueToBulkList = useCallback(
    async (qrValue: string) => {
      setScannedQrValueWrappersMap((prev) => {
        if (prev.has(qrValue)) {
          return prev;
        }
        const newQrValueWrapper = {
          key: qrValue,
          isLoading: true,
          interimValue: "loading...",
        };

        qrValueResolver(newQrValueWrapper);
        // TODO add error handling
        return new Map(prev.set(qrValue, newQrValueWrapper));
      });
    },
    [qrValueResolver]
  );

  const onScanningResult = useCallback(
    (result: string) => {
      if (isBulkModeSupported && isBulkModeActive) {
        addQrValueToBulkList(result["text"]);
      } else {
        handleSingleScan(result["text"]);
        handleClose();
      }
    },
    [
      addQrValueToBulkList,
      handleClose,
      isBulkModeActive,
      isBulkModeSupported,
      handleSingleScan,
    ]
  );

  const onFindBoxByLabel = (label: string) => {
    // TODO: refactor this big if / else into smaller methods
    if (isBulkModeSupported && isBulkModeActive) {
      setBoxesByLabelSearchWrappersMap((prev) => {
        if (prev.has(label)) {
          return prev;
        }
        const newBoxByLabelSearchWrapper = {
          key: label,
          isLoading: true,
          interimValue: `loading... (${label})`,
        };

        apolloClient
          .query<BoxDetailsQuery, BoxDetailsQueryVariables>({
            query: BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY,
            fetchPolicy: "no-cache",
            variables: { labelIdentifier: label },
          })
          .then(({ data }) => {
            const boxData = data?.box;
            if (boxData == null) {
              console.error("Box not found for this label");
              setBoxesByLabelSearchWrappersMap((prev) => {
                const newWrapperForLabelIdentifier = {
                  key: label,
                  isLoading: false,
                  interimValue: undefined,
                  finalValue: {
                    kind: "labelNotFound",
                  },
                } as IQrValueWrapper;
                const newMap = new Map(prev);
                newMap.set(label, newWrapperForLabelIdentifier);
                return newMap;
              });
            } else {
              setBoxesByLabelSearchWrappersMap((prev) => {
                const newWrapperForLabelIdentifier = {
                  key: label,
                  isLoading: false,
                  interimValue: undefined,
                  finalValue: {
                    kind: "success",
                    value: {
                      labelIdentifier: boxData.labelIdentifier,
                      product: boxData.product,
                      size: boxData.size,
                      numberOfItems: boxData.items || 0,
                    } as IBoxDetailsData,
                  },
                } as IQrValueWrapper;
                const newMap = new Map(prev);
                newMap.set(label, newWrapperForLabelIdentifier);
                return newMap;
              });
            }
          });

        return new Map(prev.set(label, newBoxByLabelSearchWrapper));
      });
    } else {
      apolloClient
        .query<BoxDetailsQuery, BoxDetailsQueryVariables>({
          query: BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY,
          fetchPolicy: "no-cache",
          variables: { labelIdentifier: label },
        })
        // TODO: add catch handling here (for failed promises)
        .then(({ data }) => {
          const boxData = data?.box;
          if (boxData == null) {
            console.error("Box not found for this label");
          } else {
            onScanningDone([
              {
                kind: "success",
                value: {
                  labelIdentifier: boxData.labelIdentifier,
                  product: boxData.product,
                  size: boxData.size,
                  numberOfItems: boxData.items || 0,
                } as IBoxDetailsData,
              },
            ]);
            handleClose();
          }
        });
    }
  };

  return (
    <QrReaderOverlay
      isOpen={isOpen}
      handleClose={handleClose}
      isBulkModeSupported={isBulkModeSupported}
      isBulkModeActive={isBulkModeActive}
      setIsBulkModeActive={setIsBulkModeActive}
      boxesByLabelSearchWrappers={boxesByLabelSearchWrappers}
      scannedQrValueWrappers={scannedQrValueWrappers}
      onBulkScanningDoneButtonClick={onBulkScanningDone}
      onScanningResult={onScanningResult}
      onFindBoxByLabel={onFindBoxByLabel}
    />
  );
};

export default QrReaderOverlayContainer;
