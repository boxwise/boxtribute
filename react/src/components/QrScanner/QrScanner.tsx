import {
  Box,
  Button,
  Checkbox,
  Container,
  HStack,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { QrReader } from "components/QrReader/QrReader";
import { Dispatch, SetStateAction, useCallback, useRef, useState } from "react";

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

export interface QrValueWrapper {
  key: string;
  isLoading: boolean;
  interimValue?: string;
  finalValue?: string;
}

export interface QrScannerProps {
  isBulkModeSupported: boolean;
  // scannedQrValues: QrValueWrapper[];
  // setScannedQrValues: ((scannedQrValues: string[]) => void) | ((setter: ((prev: string[]) => string[])) => void)
  // setScannedQrValues: Dispatch<SetStateAction<QrValueWrapper[]>>;
  // setScannedQrValues: ((setter: ((prev: string[]) => string[])) => void)
  onBulkScanningDone: (qrValues: QrValueWrapper[]) => void;
  // bulkModeActive: boolean;
  // onToggleBulkMode: () => void;
  onResult: (qrValue: string) => void;
  qrValueResolver: (
    qrValueWrapper: QrValueWrapper
  ) => Promise<QrValueWrapper> | QrValueWrapper;
  // updateQrValueWrapper: (qrValueWrapper)
  // onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
}
const QrScanner = ({
  isBulkModeSupported,
  isOpen,
  onBulkScanningDone,
  qrValueResolver,
  // updateQrValueWrapper,
  // bulkModeActive,
  // onToggleBulkMode,
  onResult,
  // onOpen,
  onClose,
}: QrScannerProps) => {
  const [isBulkModeActive, setIsBulkModeActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const onToggleBulkMode = () => setIsBulkModeActive((prev) => !prev);
  const [scannedQrValues, setScannedQrValues] = useState<Map<string, QrValueWrapper>>(new Map());

  const onBulkScanningDoneButtonClick = useCallback(() => {
    onBulkScanningDone(
      Array.from(scannedQrValues.values()).map(c => c)
    )
  }, [onBulkScanningDone, scannedQrValues]);

  const scannerBlockedSignal = useRef(false);

  const addQrValueToBulkList = //useCallback(
    async (qrValue: string) => {
    alert(`scannedQrValues: ${JSON.stringify(Array.from(scannedQrValues.entries()))}`);
    console.debug("scannedQrValues", Array.from(scannedQrValues.entries()));
    console.debug("qrValue", qrValue);
    // if (scannedQrValues.some((curr) => curr.key === qrValue)) {
    if (!scannedQrValues.has(qrValue)) {
      alert(`Not yet there; qrValue: ${qrValue}; scannedQrValues: ${JSON.stringify(Array.from(scannedQrValues.entries()))}`)
      const newQrValueWrapper = {
        key: qrValue,
        isLoading: true,
        interimValue: "loading...",
      };
      setScannedQrValues((prev) => new Map(prev.set(qrValue, newQrValueWrapper)));

      const resolvedQrValueWrapper = await qrValueResolver(newQrValueWrapper);
      setScannedQrValues((prev) => {
        // const index = prev.findIndex(
        //   (curr) => curr.key === resolvedQrValueWrapper.key
        // );
        // const scannedQrValues = [
        //   ...prev.slice(0, index),
        //   resolvedQrValueWrapper,
        //   ...prev.slice(index + 1),
        // ];
        return new Map(prev.set(qrValue, resolvedQrValueWrapper));
      });
    }
    scannerBlockedSignal.current = false;
    // alert("leaving addQrValueToBulkList");
  }//, [qrValueResolver, scannedQrValues]);

  return (
    <Modal
      isOpen={isOpen}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>QR Scanner</ModalHeader>
        {/* <ModalCloseButton /> */}
        <ModalBody>
          <Container maxW="md">
            <QrReader
              videoId="video"
              ViewFinder={ViewFinder}
              constraints={{
                facingMode: "environment",
                zoom: zoomLevel,
              }}
              scanDelay={1000}
              onResult={(result, error) => {
                if (scannerBlockedSignal.current) {
                  // alert("onResult - scannerBlockedSignal.current === true");
                  return;
                }

                if (!!result) {
                  if (isBulkModeSupported && isBulkModeActive) {
                    scannerBlockedSignal.current = true;
                    addQrValueToBulkList(result["text"]);
                  } else {
                    onResult(result["text"]);
                  }
                }
                if (!!error) {
                  // console.info(error);
                }
              }}
            />
            {isBulkModeSupported && (
              <HStack>
                <HStack>
                  <Button
                    disabled={zoomLevel <= 1}
                    onClick={() =>
                      setZoomLevel((curr) => (curr > 1 ? curr - 1 : curr))
                    }
                  >
                    -
                  </Button>
                  <Button
                    disabled={zoomLevel >= 8}
                    onClick={() =>
                      setZoomLevel((curr) => (curr < 8 ? curr + 1 : curr))
                    }
                  >
                    +
                  </Button>
                </HStack>
                <Button onClick={onToggleBulkMode}>Bulk Mode</Button>
              </HStack>
            )}
            {isBulkModeSupported && isBulkModeActive && (
              <VStack>
                <Box>
                  scannedQrValues:{" "}
                  {JSON.stringify(Array.from(scannedQrValues.entries()))} <br />
                </Box>
                <VStack spacing={5} direction="row">
                  {Array.from(scannedQrValues.keys()).map((key) => {
                    const qrCodeValueWrapper = scannedQrValues.get(key)!;
                    return (
                      <Checkbox
                        key={key}
                        colorScheme="green"
                        defaultChecked={qrCodeValueWrapper.isLoading}
                        disabled={qrCodeValueWrapper.isLoading}
                      >
                        {qrCodeValueWrapper.isLoading
                          ? qrCodeValueWrapper.interimValue
                          : qrCodeValueWrapper.finalValue}
                      </Checkbox>
                    );
                  })}
                </VStack>
                <Button
                  onClick={onBulkScanningDoneButtonClick}
                  colorScheme="blue"
                >
                  Scanning done
                </Button>
              </VStack>
            )}
          </Container>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QrScanner;
