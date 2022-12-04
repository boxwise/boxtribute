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
  NumberInput,
  NumberInputField,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react";
import { OnResultFunction, QrReader } from "components/QrReader/QrReader";
import { useCallback, useMemo, useState } from "react";

import { Result } from "@zxing/library";
import { IBoxDetailsData } from "utils/base-types";

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
      <path fill="none" d="M13,0 L0,0 L0,13" stroke="rgba(255, 0, 0, 0.5)" strokeWidth="5" />
      <path fill="none" d="M0,87 L0,100 L13,100" stroke="rgba(255, 0, 0, 0.5)" strokeWidth="5" />
      <path
        fill="none"
        d="M87,100 L100,100 L100,87"
        stroke="rgba(255, 0, 0, 0.5)"
        strokeWidth="5"
      />
      <path fill="none" d="M100,13 L100,0 87,0" stroke="rgba(255, 0, 0, 0.5)" strokeWidth="5" />
    </svg>
  </>
);

export interface QrResolverResultSuccessValue {
  kind: "success";
  value: IBoxDetailsData;
}

export interface QrResolverResultNotAssignedToBox {
  kind: "notAssignedToBox";
  qrCodeValue: string;
}

// interface QrResolverResultNotAuthorized {
//   kind: "notAuthorized";
// }

export interface QrResolverResultLabelNotFound {
  kind: "labelNotFound";
}

export interface QrResolverResultNoBoxtributeQr {
  kind: "noBoxtributeQr";
}

export type QrResolvedValue =
  | QrResolverResultSuccessValue
  | QrResolverResultNotAssignedToBox
  | QrResolverResultNoBoxtributeQr
  | QrResolverResultLabelNotFound;
// | QrResolverResultNotAuthorized;

export interface IQrValueWrapper {
  key: string;
  isLoading: boolean;
  interimValue?: string;
  finalValue?: QrResolvedValue;
}

export interface QrReaderOverlayProps {
  isBulkModeSupported: boolean;
  isBulkModeActive: boolean;
  setIsBulkModeActive: {
    on: () => void;
    off: () => void;
    toggle: () => void;
  };
  boxesByLabelSearchWrappers: IQrValueWrapper[];
  onScanningResult: (result: string) => void;
  scannedQrValueWrappers: IQrValueWrapper[];
  onFindBoxByLabel: (label: string) => void;
  onBulkScanningDoneButtonClick: () => void;
  handleClose: () => void;
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
          <Badge colorScheme="green">{finalValue.value.labelIdentifier}</Badge>
        </Checkbox>
      );
    }

    case "noBoxtributeQr": {
      return <Badge colorScheme="red">Not a Boxtribute QR Code</Badge>;
    }
    case "notAssignedToBox": {
      return <Badge colorScheme="gray">Not yet assigned to any Box</Badge>;
    }

    case "labelNotFound": {
      return <Badge colorScheme="red">Label not found</Badge>;
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
  isBulkModeActive,
  setIsBulkModeActive,
  onFindBoxByLabel,
  onBulkScanningDoneButtonClick,
  handleClose,
  onScanningResult,
  boxesByLabelSearchWrappers,
  scannedQrValueWrappers,
}: QrReaderOverlayProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  // TODO: consider to lift this Map state up

  const browserSupportsZoom = useMemo(
    () => navigator?.mediaDevices?.getSupportedConstraints?.().zoom != null,
    [],
  );

  const facingMode = "environment";

  const onResult: OnResultFunction = useCallback(
    (result: Result | undefined | null, error: Error | undefined | null) => {
      if (!!result) {
        onScanningResult(result["text"]);
      }
    },
    [onScanningResult],
  );

  const [boxLabelInputValue, setBoxLabelInputValue] = useState("");

  return (
    <Modal isOpen={isOpen} closeOnOverlayClick={true} closeOnEsc={true} onClose={handleClose}>
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
            {/* <Box width={300} height={300} backgroundColor="gray"></Box> */}
            <HStack>
              {browserSupportsZoom && (
                <HStack>
                  <IconButton
                    disabled={zoomLevel <= 1}
                    onClick={() => setZoomLevel((curr) => (curr > 1 ? curr - 1 : curr))}
                    aria-label={"Decrease zoom level"}
                  >
                    <MinusIcon />
                  </IconButton>
                  <IconButton
                    disabled={zoomLevel >= 8}
                    onClick={() => setZoomLevel((curr) => (curr < 8 ? curr + 1 : curr))}
                    aria-label={"Increase zoom level"}
                  >
                    <AddIcon />
                  </IconButton>
                </HStack>
              )}
            </HStack>
            <HStack borderColor="blackAlpha.100" borderWidth={2} p={4} my={5}>
              <Text fontWeight="bold">By Label</Text>
              <NumberInput
                data-testid="boxLabelIdentifier"
                width={150}
                onChange={setBoxLabelInputValue}
                value={boxLabelInputValue}
              >
                <NumberInputField />
              </NumberInput>
              {/* <Button onClick={() => onFindBoxByLabel(boxLabelInputValue)}>Find</Button> */}
              <Button
                onClick={() => {
                  if (boxLabelInputValue != null && boxLabelInputValue !== "") {
                    onFindBoxByLabel(boxLabelInputValue);
                    setBoxLabelInputValue("");
                  }
                }}
              >
                Find
              </Button>
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
                    <VStack>
                      <Text fontWeight="bold">Scanned Boxes</Text>
                      <VStack spacing={5} direction="row">
                        {scannedQrValueWrappers.map((qrCodeValueWrapper, i) => {
                          return (
                            <Box key={i}>
                              {i + 1} <QrValueWrapper qrCodeValueWrapper={qrCodeValueWrapper} />
                            </Box>
                          );
                        })}
                      </VStack>
                    </VStack>

                    <VStack>
                      <Text fontWeight="bold">Boxes by label search</Text>
                      <VStack spacing={5} direction="row">
                        {boxesByLabelSearchWrappers.map((boxByLabelSearchWrapper, i) => {
                          return (
                            <Box key={i}>
                              {i + 1}{" "}
                              <QrValueWrapper qrCodeValueWrapper={boxByLabelSearchWrapper} />
                            </Box>
                          );
                        })}
                      </VStack>
                    </VStack>
                    <Button
                      onClick={onBulkScanningDoneButtonClick}
                      colorScheme="blue"
                      disabled={scannedQrValueWrappers.filter((el) => el.isLoading).length !== 0}
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
