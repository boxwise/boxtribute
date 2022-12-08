import { useCallback, useMemo, useState } from "react";
import { useApolloClient } from "@apollo/client";
import {
  BoxDetailsQuery,
  BoxDetailsQueryVariables,
  GetBoxLabelIdentifierForQrCodeQuery,
  GetBoxLabelIdentifierForQrCodeQueryVariables,
} from "types/generated/graphql";
import QrReaderOverlay, {
  IQrValueWrapper,
  QrResolvedValue,
  QrResolverResultKind,
} from "./QrReaderOverlay";
import { Box, useBoolean } from "@chakra-ui/react";
import _ from "lodash";
import { IBoxDetailsData } from "utils/base-types";
import {
  GET_BOX_LABEL_IDENTIFIER_BY_QR_CODE,
  BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY,
} from "utils/queries";
import { notificationVar } from "components/NotificationMessage";
import { extractQrCodeFromUrl } from "utils/helpers";

interface QrReaderOverlayContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanningDone: (qrValueWrappers: QrResolvedValue[]) => void;
}

const boxDataToSuccessQrValue = (boxData: BoxDetailsQuery["box"]) => {
  // TODO: replace this with cleaner/proper parsing/validation (e.g. via zod)
  // Or make remove the nullable fields from the GraphQL API
  if (
    boxData == null
    //  ||
    // boxData.product == null ||
    // boxData.location == null ||
    // boxData.location.base == null
  ) {
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
  } as QrResolvedValue;
};

const QrReaderOverlayContainer = ({
  isOpen,
  onClose,
  onScanningDone,
}: QrReaderOverlayContainerProps) => {
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
        const resolvedQrValueWrapper = {
          ...qrValueWrapper,
          isLoading: false,
          finalValue: { kind: QrResolverResultKind.NOT_BOXTRIBUTE_QR },
        } as IQrValueWrapper;
        notificationVar({
          title: "Error",
          type: "error",
          message: "Error: Not a Boxtribute QR Code",
        });
        addQrValueWrapperToMap(resolvedQrValueWrapper);
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
            const boxLabelIdentifier = data?.qrCode?.box?.labelIdentifier;
            if (boxLabelIdentifier == null) {
              const resolvedQrValueWrapper = {
                ...qrValueWrapper,
                isLoading: false,
                finalValue: {
                  kind: QrResolverResultKind.NOT_ASSIGNED_TO_BOX,
                  qrCodeValue: extractedQrCodeFromUrl,
                },
              } as IQrValueWrapper;

              notificationVar({
                title: "Unassigned QR Code",
                type: "info",
                message: "QR Code not assigned to any box yet",
              });

              addQrValueWrapperToMap(resolvedQrValueWrapper);
            } else {
              // TODO: also handle cases here when the base of the box is not the
              // same as the current base of the user.
              // E.g. introduce another non-success kind for this case.
              const resolvedQrValueWrapper = {
                ...qrValueWrapper,
                isLoading: false,
                finalValue: boxDataToSuccessQrValue(data?.qrCode?.box),
              } as IQrValueWrapper;
              addQrValueWrapperToMap(resolvedQrValueWrapper);
            }
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
    [addQrValueWrapperToMap, apolloClient],
  );

  const handleSingleScan = useCallback(
    (result: string) => {
      const qrCode = extractQrCodeFromUrl(result);
      if (qrCode == null) {
        notificationVar({
          title: "Error",
          type: "error",
          message: "Not a Boxtribute QR Code",
        });
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
          .then(({ data }) => {
            const boxLabelIdentifier = data?.qrCode?.box?.labelIdentifier;
            if (boxLabelIdentifier == null) {
              onScanningDone([
                { kind: QrResolverResultKind.NOT_ASSIGNED_TO_BOX, qrCodeValue: qrCode },
              ]);
              notificationVar({
                title: "Error",
                type: "error",
                message: "Error: Not a Boxtribute QR Code",
              });
            } else {
              // TODO: also handle cases here when the base of the box is not the
              // same as the current base of the user.
              // E.g. introduce another non-success kind for this case.
              onScanningDone([boxDataToSuccessQrValue(data?.qrCode?.box)]);
            }
          });
      }
    },
    [apolloClient, onScanningDone],
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
      // TODO: improve typings/type handling here (to get rid of the `!`)
      .map((qrValueWrapper) => qrValueWrapper.finalValue)
      .value() as QrResolvedValue[];
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

  const onScanningResult = useCallback(
    (result: string) => {
      if (isBulkModeSupported && isBulkModeActive) {
        addQrValueToBulkList(result);
      } else {
        handleSingleScan(result);
        handleClose();
      }
    },
    [addQrValueToBulkList, handleClose, isBulkModeActive, isBulkModeSupported, handleSingleScan],
  );

  const handleFindBoxByLabelForNonBulkMode = useCallback(
    (label: string) => {
      apolloClient
        .query<BoxDetailsQuery, BoxDetailsQueryVariables>({
          query: BOX_DETAILS_BY_LABEL_IDENTIFIER_QUERY,
          fetchPolicy: "no-cache",
          variables: { labelIdentifier: label },
        })
        .then(({ data }) => {
          const boxData = data?.box;
          if (boxData == null) {
            notificationVar({
              title: "Error",
              type: "error",
              message: "Error: Box not found for this label",
            });
          } else {
            // TODO: also handle cases here when the base of the box is not the
            // same as the current base of the user.
            // E.g. introduce another non-success kind for this case.
            onScanningDone([boxDataToSuccessQrValue(boxData)]);
            handleClose();
          }
        })
        .catch((e) => {
          notificationVar({
            title: "Error",
            type: "error",
            message: "Error: Cannot scan the QR code",
          });
        });
    },
    [apolloClient, handleClose, onScanningDone],
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
          .then(({ data }) => {
            const boxData = data?.box;
            if (boxData == null) {
              notificationVar({
                title: "Error",
                type: "error",
                message: "Error: Box not found for this label",
              });
              setBoxesByLabelSearchWrappersMap((prev) => {
                const newWrapperForLabelIdentifier = {
                  key: label,
                  isLoading: false,
                  interimValue: undefined,
                  finalValue: {
                    kind: QrResolverResultKind.LABEL_NOT_FOUND,
                  },
                } as IQrValueWrapper;
                const newMap = new Map(prev);
                newMap.set(label, newWrapperForLabelIdentifier);
                return newMap;
              });
            } else {
              // TODO: also handle cases here when the base of the box is not the
              // same as the current base of the user.
              // E.g. introduce another non-success kind for this case.
              setBoxesByLabelSearchWrappersMap((prev) => {
                const newWrapperForLabelIdentifier = {
                  key: label,
                  isLoading: false,
                  interimValue: undefined,
                  finalValue: boxDataToSuccessQrValue(boxData),
                } as IQrValueWrapper;
                const newMap = new Map(prev);
                newMap.set(label, newWrapperForLabelIdentifier);
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
        setIsBulkModeActive={setIsBulkModeActive}
        boxesByLabelSearchWrappers={boxesByLabelSearchWrappers}
        scannedQrValueWrappers={scannedQrValueWrappers}
        onBulkScanningDoneButtonClick={onBulkScanningDone}
        onScanningResult={onScanningResult}
        onFindBoxByLabel={onFindBoxByLabel}
      />
    </Box>
  );
};

export default QrReaderOverlayContainer;
