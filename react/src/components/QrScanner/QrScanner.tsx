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
import { QrReader } from "components/QrReader/QrReader";
import { useCallback, useState } from "react";

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
}

interface QrResolverResultNoBoxtributeQr {
  kind: "noBoxtributeQr";
}

export type QrResolvedValue =
  | QrResolverResultSuccessValue
  | QrResolverResultNotAssignedToBox
  | QrResolverResultNoBoxtributeQr;

export interface IQrValueWrapper {
  key: string;
  isLoading: boolean;
  interimValue?: string;
  finalValue?: QrResolvedValue;
}

export interface QrScannerProps {
  isBulkModeSupported: boolean;
  // scannedQrValues: QrValueWrapper[];
  // setScannedQrValues: ((scannedQrValues: string[]) => void) | ((setter: ((prev: string[]) => string[])) => void)
  // setScannedQrValues: Dispatch<SetStateAction<QrValueWrapper[]>>;
  // setScannedQrValues: ((setter: ((prev: string[]) => string[])) => void)
  onBulkScanningDone: (qrValues: IQrValueWrapper[]) => void;
  // bulkModeActive: boolean;
  // onToggleBulkMode: () => void;
  onSingleScanDone: (qrValue: string) => void;
  qrValueResolver: (
    qrValueWrapper: IQrValueWrapper
  ) => Promise<IQrValueWrapper>;
  // updateQrValueWrapper: (qrValueWrapper)
  // onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
}

const QrValueWrapper: React.FC<{ qrCodeValueWrapper: IQrValueWrapper }> = ({
  qrCodeValueWrapper: { key, isLoading, interimValue, finalValue },
}) => {
  return isLoading ? (
    <Box>{interimValue}</Box>
  ) : finalValue?.kind === "success" ? (
    <Checkbox
      key={key}
      colorScheme="green"
      defaultChecked={true}
      // isDisabled={qrCodeValueWrapper.isLoading || qrCodeValueWrapper.finalValue?.kind !== "success"}
    >
      <Badge colorScheme="green">{finalValue.value}</Badge>
    </Checkbox>
  ) : finalValue?.kind === "noBoxtributeQr" ? (
    <Badge colorScheme="red">Not a Boxtribute QR Code</Badge>
  ) : (
    <Badge colorScheme="gray">Not yet assigned to any Box</Badge>
  );
};

const QrScanner = ({
  isBulkModeSupported,
  isOpen,
  onBulkScanningDone,
  qrValueResolver,
  // updateQrValueWrapper,
  // bulkModeActive,
  // onToggleBulkMode,
  onSingleScanDone,
  // onOpen,
  onClose,
}: QrScannerProps) => {
  const [isBulkModeActive, setIsBulkModeActive] = useBoolean(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scannedQrValues, setScannedQrValues] = useState<
    Map<string, IQrValueWrapper>
  >(new Map());

  const onBulkScanningDoneButtonClick = useCallback(() => {
    onBulkScanningDone(Array.from(scannedQrValues.values()).map((c) => c));
  }, [onBulkScanningDone, scannedQrValues]);

  // const scannerBlockedSignal = useRef(false);

  const addQrValueToBulkList = useCallback(async (qrValue: string) => {
    // alert(`scannedQrValues: ${JSON.stringify(Array.from(scannedQrValues.entries()))}`);
    console.log("FOO!!!!!");
    // console.log("scannedQrValues.size", scannedQrValues.size);
    // console.log("scannedQrValues", Array.from(scannedQrValues.entries()));
    // console.log("qrValue", qrValue);
    // if (scannedQrValues.some((curr) => curr.key === qrValue)) {
    // console.log("scannedQrValues.has(qrValue)", scannedQrValues.has(qrValue));

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

    // scannerBlockedSignal.current = false;

    // if (!scannedQrValues.has(qrValue)) {
    //   // alert(`Not yet there; qrValue: ${qrValue}; scannedQrValues: ${JSON.stringify(Array.from(scannedQrValues.entries()))}`)
    //   const newQrValueWrapper = {
    //     key: qrValue,
    //     isLoading: true,
    //     interimValue: "loading...",
    //   };
    //   // console.log("qrValue", qrValue);
    //   // console.log("scannedQrValues", scannedQrValues);
    //   // console.log("newQrValueWrapper", newQrValueWrapper);
    //   setScannedQrValues(
    //     (prev) => new Map(prev.set(qrValue, newQrValueWrapper))
    //   );

    //   // alert("NEW QR SCANNED AND WAITING NOW TO RESOLVE");
    //   const resolvedQrValueWrapper = await qrValueResolver(newQrValueWrapper);
    //   setScannedQrValues(
    //     (prev) => new Map(prev.set(qrValue, resolvedQrValueWrapper))
    //   );
    // }
    // console.log("------------------------------------------------------");
    // scannerBlockedSignal.current = false;
    // alert("leaving addQrValueToBulkList");
  }, []);

  const scannedQrValuesAsArray = Array.from(scannedQrValues.keys()).map(
    (key) => scannedQrValues.get(key)!
  );

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
            {/* LENGTH: {scannedQrValues.size}
            <br />
            {JSON.stringify(
              Array.from(scannedQrValues.entries()).map((c) => c[0])
            )} */}
            <QrReader
              videoId="video"
              ViewFinder={ViewFinder}
              constraints={{
                facingMode: "environment",
                zoom: zoomLevel,
              }}
              scanDelay={1000}
              onResult={(result, error) => {
                // if (scannerBlockedSignal.current === true) {
                //   // alert("onResult - scannerBlockedSignal.current === true");
                //   return;
                // }

                if (!!result) {
                  if (isBulkModeSupported && isBulkModeActive) {
                    // scannerBlockedSignal.current = true;
                    addQrValueToBulkList(result["text"]);
                  } else {
                    onSingleScanDone(result["text"]);
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
              </HStack>
            )}
            {isBulkModeSupported && isBulkModeActive && (
              <VStack>
                {/* <Box>
                  scannedQrValues:{" "}
                  {JSON.stringify(Array.from(scannedQrValues.entries()))} <br />
                </Box> */}
                <VStack spacing={5} direction="row">
                  {scannedQrValuesAsArray.map((qrCodeValueWrapper, i) => {
                    // alert(`qrCodeValueWrapper: ${JSON.stringify(qrCodeValueWrapper)}`);
                    return (
                      <Box key={i}>{i+1} <QrValueWrapper qrCodeValueWrapper={qrCodeValueWrapper} /></Box>
                    );
                  })}
                </VStack>
                <Button
                  onClick={onBulkScanningDoneButtonClick}
                  colorScheme="blue"
                  disabled={
                    scannedQrValuesAsArray.filter((el) => !el.isLoading).length === 0
                  }
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
