import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  useBoolean,
  VStack,
} from "@chakra-ui/react";
import { OnResultFunction, QrReader } from "components/QrReader/QrReader";
// import { OnResultFunction } from "components/QrReader/types";
import { useCallback, useMemo, useState } from "react";

import { Result } from "@zxing/library";

export const ViewFinder = () => (
  <>
    <svg
      width="50px"
      viewBox="0 0 100 100"
      style={{
        top: 0,
        left: 0,
        zIndex: 1,
        boxSizing: "border-box",
        border: "50px solid rgba(0, 0, 0, 0.3)",
        position: "absolute",
        width: "100%",
        height: "100%",
      }}
    >
      <path
        fill="none"
        d="M13,0 L0,0 L0,13"
        stroke="rgba(255, 0, 0, 0.5)"
        strokeWidth="5"
      />
      <path
        fill="none"
        d="M0,87 L0,100 L13,100"
        stroke="rgba(255, 0, 0, 0.5)"
        strokeWidth="5"
      />
      <path
        fill="none"
        d="M87,100 L100,100 L100,87"
        stroke="rgba(255, 0, 0, 0.5)"
        strokeWidth="5"
      />
      <path
        fill="none"
        d="M100,13 L100,0 87,0"
        stroke="rgba(255, 0, 0, 0.5)"
        strokeWidth="5"
      />
    </svg>
  </>
);

interface QrResolverResultSuccessValue {
  kind: "success";
  value: string;
}

interface QrResolverResultNotAssignedToBox {
  kind: "notAssignedToBox";
  qrCodeValue: string;
}

// interface QrResolverResultNotAuthorized {
//   kind: "notAuthorized";
// }

interface QrResolverResultNoBoxtributeQr {
  kind: "noBoxtributeQr";
}

export type QrResolvedValue =
  | QrResolverResultSuccessValue
  | QrResolverResultNotAssignedToBox
  | QrResolverResultNoBoxtributeQr;
// | QrResolverResultNotAuthorized;

export interface IQrValueWrapper {
  key: string;
  isLoading: boolean;
  interimValue?: string;
  finalValue?: QrResolvedValue;
}

export interface QrReaderOverlayProps {
  isBulkModeSupported: boolean;
  onBulkScanningDone: (qrValues: IQrValueWrapper[]) => void;
  onSingleScanDone: (qrValue: string) => void;
  qrValueResolver: (
    qrValueWrapper: IQrValueWrapper
  ) => Promise<IQrValueWrapper>;
  onClose: () => void;
  isOpen: boolean;
}

const QrValueWrapper: React.FC<{ qrCodeValueWrapper: IQrValueWrapper }> = ({
  qrCodeValueWrapper,
}) => {
  const { key, isLoading, interimValue, finalValue } = qrCodeValueWrapper;

  if (isLoading) {
    return <Box>{interimValue}</Box>;
  }
  switch (finalValue?.kind) {
    case "success": {
      return (
        <Checkbox key={key} colorScheme="green" defaultChecked={true}>
          <Badge colorScheme="green">{finalValue.value}</Badge>
        </Checkbox>
      );
    }

    case "noBoxtributeQr": {
      return <Badge colorScheme="red">Not a Boxtribute QR Code</Badge>;
    }
    case "notAssignedToBox": {
      return <Badge colorScheme="gray">Not yet assigned to any Box</Badge>;
    }
    // case "notAuthorized": {
    //   return (
    //     <Badge colorScheme="red">
    //       You're not authorized to view/edit this Box
    //     </Badge>
    //   );
    // }
    default: {
      // TODO: consider to handle the fallback case better
      return <></>;
    }
  }
};

const QrReaderOverlay = ({
  isBulkModeSupported,
  isOpen,
  onBulkScanningDone,
  qrValueResolver,
  onSingleScanDone,
  onClose,
}: QrReaderOverlayProps) => {
  const [isBulkModeActive, setIsBulkModeActive] = useBoolean(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scannedQrValues, setScannedQrValues] = useState<
    Map<string, IQrValueWrapper>
  >(new Map());

  const browserSupportsZoom = useMemo(
    () => navigator?.mediaDevices?.getSupportedConstraints?.().zoom != null,
    []
  );

  const resetState = useCallback(() => {
    setScannedQrValues(() => new Map());
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const onBulkScanningDoneButtonClick = useCallback(() => {
    onBulkScanningDone(
      Array.from(scannedQrValues.values()).filter(
        (qrValueWrapper) => qrValueWrapper.finalValue?.kind !== "noBoxtributeQr"
      )
    );
    handleClose();
  }, [handleClose, onBulkScanningDone, scannedQrValues]);

  const addQrValueToBulkList = useCallback(
    async (qrValue: string) => {
      setScannedQrValues((prev) => {
        if (prev.has(qrValue)) {
          return prev;
        }
        const newQrValueWrapper = {
          key: qrValue,
          isLoading: true,
          interimValue: "loading...",
        };

        qrValueResolver(newQrValueWrapper).then((resolvedQrValueWrapper) => {
          setScannedQrValues((prev) => {
            return new Map(prev.set(qrValue, resolvedQrValueWrapper));
          });
        });
        // TODO add error handling
        // .catch((err) => {}).finally(() => {}))

        return new Map(prev.set(qrValue, newQrValueWrapper));
      });
    },
    [qrValueResolver]
  );

  const scannedQrValuesAsArray = useMemo(
    () =>
      Array.from(scannedQrValues.keys()).map(
        (key) => scannedQrValues.get(key)!
      ),
    [scannedQrValues]
  );

  const facingMode = "environment";

  const onResult: OnResultFunction = useCallback(
    (result: Result | undefined | null, error: Error | undefined | null) => {
      if (!!result) {
        if (isBulkModeSupported && isBulkModeActive) {
          addQrValueToBulkList(result["text"]);
        } else {
          onSingleScanDone(result["text"]);
          handleClose();
        }
      }
    },
    [
      addQrValueToBulkList,
      handleClose,
      isBulkModeActive,
      isBulkModeSupported,
      onSingleScanDone,
    ]
  );

  return (
    <Modal
      isOpen={isOpen}
      closeOnOverlayClick={true}
      closeOnEsc={true}
      onClose={handleClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>QR Scanner</ModalHeader>
        <ModalBody>
          <Container maxW="md">
            <QrReader
              // TODO: try to remove this hacky key setting again
              key={`${zoomLevel}-${facingMode}-${isBulkModeActive}-${isBulkModeSupported}`}
              ViewFinder={ViewFinder}
              facingMode={facingMode}
              zoom={zoomLevel}
              scanPeriod={1000}
              onResult={onResult}
            />
            <HStack>
              {browserSupportsZoom && (
                <HStack>
                  <IconButton
                    disabled={zoomLevel <= 1}
                    onClick={() =>
                      setZoomLevel((curr) => (curr > 1 ? curr - 1 : curr))
                    }
                    aria-label={"Decrease zoom level"}
                  >
                    <MinusIcon />
                  </IconButton>
                  <IconButton
                    disabled={zoomLevel >= 8}
                    onClick={() =>
                      setZoomLevel((curr) => (curr < 8 ? curr + 1 : curr))
                    }
                    aria-label={"Increase zoom level"}
                  >
                    <AddIcon />
                  </IconButton>
                </HStack>
              )}
            </HStack>
            {isBulkModeSupported && (
              <VStack borderColor="blackAlpha.100" borderWidth={2} p={4} my={5}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="Bulk Mode" mb="0">
                    Bulk Mode
                  </FormLabel>
                  <Switch
                    id="Bulk Mode"
                    onChange={setIsBulkModeActive.toggle}
                    isChecked={isBulkModeActive}
                  />
                </FormControl>
                {isBulkModeSupported && isBulkModeActive && (
                  <>
                    <VStack spacing={5} direction="row">
                      {scannedQrValuesAsArray.map((qrCodeValueWrapper, i) => {
                        return (
                          <Box key={i}>
                            {i + 1}{" "}
                            <QrValueWrapper
                              qrCodeValueWrapper={qrCodeValueWrapper}
                            />
                          </Box>
                        );
                      })}
                    </VStack>
                    <Button
                      onClick={onBulkScanningDoneButtonClick}
                      colorScheme="blue"
                      disabled={
                        scannedQrValuesAsArray.filter((el) => !el.isLoading)
                          .length === 0
                      }
                    >
                      Scanning done
                    </Button>
                  </>
                )}
              </VStack>
            )}
          </Container>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={handleClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QrReaderOverlay;
