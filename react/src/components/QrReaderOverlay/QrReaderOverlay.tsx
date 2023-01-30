import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react";
import { OnResultFunction, QrReader } from "components/QrReader/QrReader";
import { useCallback, useMemo, useState, FC } from "react";

import { Result } from "@zxing/library";

export function ViewFinder() {
  return (
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
  );
}

// eslint-disable-next-line no-shadow
export enum QrResolverResultKind {
  SUCCESS = "success",
  FAIL = "fail",
  NOT_ASSIGNED_TO_BOX = "notAssignedToBox",
  LABEL_NOT_FOUND = "labelNotFound",
  NOT_AUTHORIZED = "notAuthorized",
  NOT_BOXTRIBUTE_QR = "noBoxtributeQr",
}

export interface IQrResolvedValue {
  kind: QrResolverResultKind;
  qrCodeValue?: string;
  value?: any;
  error?: any;
}
export interface IQrValueWrapper {
  key: string;
  isLoading: boolean;
  interimValue?: string;
  finalValue?: IQrResolvedValue;
}

export interface IQrReaderOverlayProps {
  isBulkModeSupported: boolean;
  isBulkModeActive: boolean;
  isFindBoxByLabelForNonBulkModeLoading: boolean;
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

// eslint-disable-next-line max-len, func-names
const QrValueWrapper: FC<{ qrCodeValueWrapper: IQrValueWrapper }> = function ({
  qrCodeValueWrapper,
}) {
  const { key, isLoading, interimValue, finalValue } = qrCodeValueWrapper;

  if (isLoading) {
    return <Box>{interimValue}</Box>;
  }

  switch (finalValue?.kind) {
    case QrResolverResultKind.SUCCESS: {
      return (
        <Checkbox key={key} colorScheme="green" defaultChecked>
          <Badge colorScheme="green">{finalValue.value.labelIdentifier}</Badge>
        </Checkbox>
      );
    }
    case QrResolverResultKind.NOT_BOXTRIBUTE_QR: {
      return <Badge colorScheme="red">Not a Boxtribute QR Code</Badge>;
    }
    case QrResolverResultKind.NOT_ASSIGNED_TO_BOX: {
      return <Badge colorScheme="gray">Not yet assigned to any Box</Badge>;
    }

    case QrResolverResultKind.LABEL_NOT_FOUND: {
      return <Badge colorScheme="red">Label not found</Badge>;
    }
    case QrResolverResultKind.NOT_AUTHORIZED: {
      return <Badge colorScheme="red">You are not authorized to view/edit this Box</Badge>;
    }
    default: {
      // TODO: consider to handle the fallback case better
      return <Badge />;
    }
  }
};

function QrReaderOverlay({
  isBulkModeSupported,
  isOpen,
  isBulkModeActive,
  isFindBoxByLabelForNonBulkModeLoading,
  setIsBulkModeActive,
  onFindBoxByLabel,
  onBulkScanningDoneButtonClick,
  handleClose,
  onScanningResult,
  boxesByLabelSearchWrappers,
  scannedQrValueWrappers,
}: IQrReaderOverlayProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  // TODO: consider to lift this Map state up

  const browserSupportsZoom = useMemo(
    () => navigator?.mediaDevices?.getSupportedConstraints?.().zoom != null,
    [],
  );

  const facingMode = "environment";

  const onResult: OnResultFunction = useCallback(
    (result: Result | undefined | null) => {
      if (result) {
        onScanningResult(result.getText());
      }
    },
    [onScanningResult],
  );

  const [boxLabelInputValue, setBoxLabelInputValue] = useState("");
  const [boxLabelInputError, setBoxLabelInputError] = useState("");

  const onBoxLabelInputChange = useCallback(
    (value: string) => {
      if (!value) {
        // remove error for empty form field
        setBoxLabelInputError("");
      } else if (value.length < 6) {
        setBoxLabelInputError("Please enter at least 6 digits.");
      } else if (!/^\d+$/.test(value)) {
        setBoxLabelInputError("Please only enter digits.");
      } else {
        setBoxLabelInputError("");
      }
      setBoxLabelInputValue(value);
    },
    [setBoxLabelInputValue, setBoxLabelInputError],
  );

  return (
    <Modal isOpen={isOpen} closeOnOverlayClick closeOnEsc onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>QR Scanner</ModalHeader>
        <ModalBody>
          <Container maxW="md">
            <QrReader
              key="qrReader"
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
                    aria-label="Decrease zoom level"
                  >
                    <MinusIcon />
                  </IconButton>
                  <IconButton
                    disabled={zoomLevel >= 8}
                    onClick={() => setZoomLevel((curr) => (curr < 8 ? curr + 1 : curr))}
                    aria-label="Increase zoom level"
                  >
                    <AddIcon />
                  </IconButton>
                </HStack>
              )}
            </HStack>
            <HStack borderColor="blackAlpha.100" borderWidth={2} p={4} my={5}>
              <Text fontWeight="bold">By Label</Text>
              <FormControl isInvalid={!!boxLabelInputError}>
                <Input
                  type="string"
                  width={150}
                  onChange={(e) => onBoxLabelInputChange(e.currentTarget.value)}
                  disabled={isFindBoxByLabelForNonBulkModeLoading}
                  value={boxLabelInputValue}
                />
                <FormErrorMessage>{boxLabelInputError}</FormErrorMessage>
              </FormControl>
              <Button
                disabled={!!boxLabelInputError || isFindBoxByLabelForNonBulkModeLoading}
                isLoading={isFindBoxByLabelForNonBulkModeLoading}
                onClick={() => {
                  if (boxLabelInputValue) {
                    onFindBoxByLabel(boxLabelInputValue);
                    setBoxLabelInputValue("");
                  } else {
                    setBoxLabelInputError("Please enter a label id.");
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
                        {scannedQrValueWrappers.map((qrCodeValueWrapper, i) => (
                          <Box key={qrCodeValueWrapper.key}>
                            {i + 1} <QrValueWrapper qrCodeValueWrapper={qrCodeValueWrapper} />
                          </Box>
                        ))}
                      </VStack>
                    </VStack>

                    <VStack>
                      <Text fontWeight="bold">Boxes by label search</Text>
                      <VStack spacing={5} direction="row">
                        {boxesByLabelSearchWrappers.map((boxByLabelSearchWrapper, i) => (
                          <Box key={boxByLabelSearchWrapper.key}>
                            {i + 1} <QrValueWrapper qrCodeValueWrapper={boxByLabelSearchWrapper} />
                          </Box>
                        ))}
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
}

export default QrReaderOverlay;
