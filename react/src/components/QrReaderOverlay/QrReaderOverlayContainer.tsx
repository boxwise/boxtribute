import { useCallback, useMemo, useState } from "react";
import { useApolloClient } from "@apollo/client";
import {
  BoxDetailsQuery,
  BoxDetailsQueryVariables,
  GetBoxLabelIdentifierForQrCodeQuery,
  GetBoxLabelIdentifierForQrCodeQueryVariables,
} from "types/generated/graphql";
import { Box, useBoolean } from "@chakra-ui/react";
import _ from "lodash";
import { IBoxDetailsData } from "types/base-types";
import {
  GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
  BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY,
} from "queries/queries";
import { extractQrCodeFromUrl } from "utils/helpers";
import QrReaderOverlay, {
  IQrValueWrapper,
  IQrResolvedValue,
  QrResolverResultKind,
} from "./QrReaderOverlay";

interface IQrReaderOverlayContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanningDone: (qrValueWrappers: IQrResolvedValue[]) => void;
}

const boxDataToSuccessQrValue = (boxData: any) => {
  if (boxData == null) {
    throw new Error("boxData is null or incomplete");
  }
  const boxDetailData: IBoxDetailsData = {
    labelIdentifier: boxData.labelIdentifier,
    product: boxData.product,
    size: boxData.size,
    numberOfItems: boxData.numberOfItems || 0,
    place: boxData.location,
  };
  return {
    kind: QrResolverResultKind.SUCCESS,
    value: boxDetailData,
  } as IQrResolvedValue;
};

function QrReaderOverlayContainer({
  isOpen,
  onClose,
  onScanningDone,
}: IQrReaderOverlayContainerProps) {
  // disable bulkmode before release
  const isBulkModeSupported = false;

  const apolloClient = useApolloClient();

  const addQrValueWrapperToMap = useCallback((qrValueWrapper: IQrValueWrapper) => {
    setScannedQrValueWrappersMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(qrValueWrapper.key, qrValueWrapper);
      return newMap;
    });
  }, []);

  const qrValueResolver = useCallback(
    (qrValueWrapper: IQrValueWrapper): void => {
      const extractedQrCodeFromUrl = extractQrCodeFromUrl(qrValueWrapper.key);
      if (extractedQrCodeFromUrl == null) {
        addQrValueWrapperToMap({
          ...qrValueWrapper,
          isLoading: false,
          finalValue: { kind: QrResolverResultKind.NOT_BOXTRIBUTE_QR },
        });
      } else {
        apolloClient
          .query<GetBoxLabelIdentifierForQrCodeQuery, GetBoxLabelIdentifierForQrCodeQueryVariables>(
            {
              query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
              variables: { qrCode: extractedQrCodeFromUrl },
              fetchPolicy: "no-cache",
            },
          )
          .then(({ data, error, errors }) => {
            if (!error) {
              const boxLabelIdentifier = data?.qrCode?.box?.labelIdentifier;
              if (boxLabelIdentifier == null && (errors?.length || 0) === 0) {
                addQrValueWrapperToMap({
                  ...qrValueWrapper,
                  isLoading: false,
                  finalValue: {
                    kind: QrResolverResultKind.NOT_ASSIGNED_TO_BOX,
                    qrCodeValue: extractedQrCodeFromUrl,
                  },
                });
              } else if (boxLabelIdentifier !== null && (errors?.length || 0) === 0) {
                addQrValueWrapperToMap({
                  ...qrValueWrapper,
                  isLoading: false,
                  finalValue: boxDataToSuccessQrValue(data?.qrCode?.box),
                });
              } else if ((errors?.length || 0) > 0) {
                addQrValueWrapperToMap({
                  ...qrValueWrapper,
                  isLoading: false,
                  finalValue: {
                    kind: QrResolverResultKind.NOT_AUTHORIZED,
                    qrCodeValue: extractedQrCodeFromUrl,
                  },
                });
              }
            } else {
              addQrValueWrapperToMap({
                ...qrValueWrapper,
                isLoading: false,
                finalValue: {
                  kind: QrResolverResultKind.FAIL,
                  qrCodeValue: extractedQrCodeFromUrl,
                },
              });
            }
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
            addQrValueWrapperToMap({
              ...qrValueWrapper,
              isLoading: false,
              finalValue: {
                kind: QrResolverResultKind.FAIL,
                qrCodeValue: extractedQrCodeFromUrl,
              },
            });
          });
      }
    },
    [addQrValueWrapperToMap, apolloClient],
  );

  const [isBulkModeActive, setIsBulkModeActive] = useBoolean(false);

  const [scannedQrValueWrappersMap, setScannedQrValueWrappersMap] = useState<
    Map<string, IQrValueWrapper>
  >(new Map());

  // We are using IQrValueWrapper also for the Find Boxes By Label use case
  // since they are structurally very similar.
  // The naming of the type could be made more general though.
  // Or we indeed want to have two seperate types in case they semantically differ at some point.
  const [boxesByLabelSearchWrappersMap, setBoxesByLabelSearchWrappersMap] = useState<
    Map<string, IQrValueWrapper>
  >(new Map());

  const boxesByLabelSearchWrappers = useMemo(
    () => Array.from(boxesByLabelSearchWrappersMap.values()),
    // Array.from(
    //   boxesByLabelSearchWrappersMap.keys()).map(
    //   (key) => boxesByLabelSearchWrappersMap.get(key)!
    // ),
    [boxesByLabelSearchWrappersMap],
  );

  const scannedQrValueWrappers = useMemo(
    () =>
      Array.from(scannedQrValueWrappersMap.keys()).map(
        (key) => scannedQrValueWrappersMap.get(key)!,
      ),
    [scannedQrValueWrappersMap],
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
    handleClose();
    const resolvedQrValues = _(scannedQrValueWrappers)
      .concat(boxesByLabelSearchWrappers)
      .filter((qrValueWrapper) => qrValueWrapper.finalValue?.kind === QrResolverResultKind.SUCCESS)
      .uniqBy((el) => el.key)
      .map((qrValueWrapper) => qrValueWrapper.finalValue)
      .value() as IQrResolvedValue[];
    onScanningDone(resolvedQrValues);
  }, [boxesByLabelSearchWrappers, handleClose, onScanningDone, scannedQrValueWrappers]);

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
    [qrValueResolver],
  );

  const handleSingleScan = useCallback(
    (result: string) => {
      const qrCode = extractQrCodeFromUrl(result);
      if (qrCode == null) {
        onScanningDone([{ kind: QrResolverResultKind.NOT_BOXTRIBUTE_QR }]);
      } else {
        apolloClient
          .query<GetBoxLabelIdentifierForQrCodeQuery, GetBoxLabelIdentifierForQrCodeQueryVariables>(
            {
              query: GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
              fetchPolicy: "no-cache",
              variables: { qrCode },
            },
          )
          .then(({ data, errors }) => {
            if ((errors?.length || 0) > 0) {
              const errorCode = errors ? errors[0].extensions.code : null;
              if (errorCode === "FORBIDDEN") {
                onScanningDone([
                  { kind: QrResolverResultKind.NOT_AUTHORIZED, qrCodeValue: qrCode },
                ]);
              } else if (errorCode === "BAD_USER_INPUT") {
                onScanningDone([
                  { kind: QrResolverResultKind.NOT_BOXTRIBUTE_QR, qrCodeValue: qrCode },
                ]);
              } else {
                onScanningDone([{ kind: QrResolverResultKind.FAIL, qrCodeValue: qrCode }]);
              }
            } else if (data?.qrCode?.box == null) {
              handleClose();
              onScanningDone([
                { kind: QrResolverResultKind.NOT_ASSIGNED_TO_BOX, qrCodeValue: qrCode },
              ]);
            } else {
              handleClose();
              onScanningDone([boxDataToSuccessQrValue(data?.qrCode?.box)]);
            }
          })
          .catch((err) => {
            onScanningDone([{ kind: QrResolverResultKind.FAIL, qrCodeValue: qrCode, error: err }]);
          });
      }
    },
    [apolloClient, onScanningDone, handleClose],
  );

  const onScanningResult = useCallback(
    (result: string) => {
      if (isBulkModeSupported && isBulkModeActive) {
        addQrValueToBulkList(result);
      } else {
        handleSingleScan(result);
      }
    },
    [addQrValueToBulkList, isBulkModeActive, isBulkModeSupported, handleSingleScan],
  );

  // Find Box by labelidentifier Definitions

  const [isFindByBoxLabelForNonBulkModeLoading, setIsFindByBoxLabelForNonBulkModeLoading] =
    useBoolean(false);

  const handleFindBoxByLabelForNonBulkMode = useCallback(
    (label: string) => {
      setIsFindByBoxLabelForNonBulkModeLoading.on();
      apolloClient
        .query<BoxDetailsQuery, BoxDetailsQueryVariables>({
          query: BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY,
          fetchPolicy: "no-cache",
          variables: { labelIdentifier: label },
        })
        .then(({ data, errors }) => {
          setIsFindByBoxLabelForNonBulkModeLoading.off();
          if ((errors?.length || 0) > 0) {
            const errorCode = errors ? errors[0].extensions.code : null;
            if (errorCode === "FORBIDDEN") {
              onScanningDone([{ kind: QrResolverResultKind.NOT_AUTHORIZED }]);
            } else if (errorCode === "BAD_USER_INPUT") {
              onScanningDone([{ kind: QrResolverResultKind.LABEL_NOT_FOUND }]);
            } else {
              onScanningDone([{ kind: QrResolverResultKind.LABEL_NOT_FOUND }]);
            }
          } else {
            const boxData = data?.box;
            onScanningDone([boxDataToSuccessQrValue(boxData)]);
            if (boxData !== null) {
              handleClose();
            }
          }
        })
        .catch((err) => {
          setIsFindByBoxLabelForNonBulkModeLoading.off();
          onScanningDone([{ kind: QrResolverResultKind.FAIL, error: err }]);
        });
    },
    [apolloClient, handleClose, onScanningDone, setIsFindByBoxLabelForNonBulkModeLoading],
  );

  const handleFindBoxByLabelForBulkMode = useCallback(
    (label: string) => {
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
          .then(({ data, errors }) => {
            if ((errors?.length || 0) > 0) {
              const errorCode = errors ? errors[0].extensions.code : null;
              if (errorCode === "FORBIDDEN") {
                setBoxesByLabelSearchWrappersMap(() => {
                  const newMap = new Map(prev);
                  newMap.set(label, {
                    key: label,
                    isLoading: false,
                    interimValue: undefined,
                    finalValue: {
                      kind: QrResolverResultKind.NOT_AUTHORIZED,
                    },
                  });
                  return newMap;
                });
              } else if (errorCode === "BAD_USER_INPUT") {
                setBoxesByLabelSearchWrappersMap(() => {
                  const newMap = new Map(prev);
                  newMap.set(label, {
                    key: label,
                    isLoading: false,
                    interimValue: undefined,
                    finalValue: {
                      kind: QrResolverResultKind.LABEL_NOT_FOUND,
                    },
                  });
                  return newMap;
                });
              } else {
                setBoxesByLabelSearchWrappersMap(() => {
                  const newMap = new Map(prev);
                  newMap.set(label, {
                    key: label,
                    isLoading: false,
                    interimValue: undefined,
                    finalValue: {
                      kind: QrResolverResultKind.FAIL,
                    },
                  });
                  return newMap;
                });
              }
            }

            const boxData = data?.box;
            if (boxData == null) {
              setBoxesByLabelSearchWrappersMap(() => {
                const newMap = new Map(prev);
                newMap.set(label, {
                  key: label,
                  isLoading: false,
                  interimValue: undefined,
                  finalValue: {
                    kind: QrResolverResultKind.LABEL_NOT_FOUND,
                  },
                });
                return newMap;
              });
            } else {
              setBoxesByLabelSearchWrappersMap(() => {
                const newMap = new Map(prev);
                newMap.set(label, {
                  key: label,
                  isLoading: false,
                  interimValue: undefined,
                  finalValue: boxDataToSuccessQrValue(boxData),
                });
                return newMap;
              });
            }
          });

        return new Map(prev.set(label, newBoxByLabelSearchWrapper));
      });
    },
    [apolloClient],
  );

  const onFindBoxByLabel = (label: string) => {
    if (isBulkModeSupported && isBulkModeActive) {
      handleFindBoxByLabelForBulkMode(label);
    } else {
      handleFindBoxByLabelForNonBulkMode(label);
    }
  };

  return (
    <Box>
      {JSON.stringify(setScannedQrValueWrappersMap)}
      <QrReaderOverlay
        isOpen={isOpen}
        handleClose={handleClose}
        isBulkModeSupported={isBulkModeSupported}
        isBulkModeActive={isBulkModeActive}
        isFindBoxByLabelForNonBulkModeLoading={isFindByBoxLabelForNonBulkModeLoading}
        setIsBulkModeActive={setIsBulkModeActive}
        boxesByLabelSearchWrappers={boxesByLabelSearchWrappers}
        scannedQrValueWrappers={scannedQrValueWrappers}
        onBulkScanningDoneButtonClick={onBulkScanningDone}
        onScanningResult={onScanningResult}
        onFindBoxByLabel={onFindBoxByLabel}
      />
    </Box>
  );
}

export default QrReaderOverlayContainer;
