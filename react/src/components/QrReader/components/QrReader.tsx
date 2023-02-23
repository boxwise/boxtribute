import { useCallback, useMemo, useState } from "react";
import { Result } from "@zxing/library";
import {
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  HStack,
  IconButton,
  Input,
  Text,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { OnResultFunction, QrReaderScanner } from "./QrReaderScanner";
import { ViewFinder } from "./ViewFinder";

export interface IQrReaderProps {
  findBoxByLabelIsLoading: boolean;
  onScan: (result: string, isMulti: boolean) => void;
  onFindBoxByLabel: (label: string) => void;
}

function QrReader({ findBoxByLabelIsLoading, onScan, onFindBoxByLabel }: IQrReaderProps) {
  // Zoom
  const [zoomLevel, setZoomLevel] = useState(1);
  const browserSupportsZoom = useMemo(
    () => navigator?.mediaDevices?.getSupportedConstraints?.().zoom != null,
    [],
  );

  // Did the QrReaderScanner catch a QrCode? --> call onScan with text value
  const onResult: OnResultFunction = useCallback(
    (qrReaderResult: Result | undefined | null) => {
      if (qrReaderResult) {
        onScan(qrReaderResult.getText(), false);
      }
    },
    [onScan],
  );

  // Input Validation for Find Box By Label Field
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
    <Container maxW="md">
      <QrReaderScanner
        key="qrReaderScanner"
        ViewFinder={ViewFinder}
        facingMode="environment"
        zoom={zoomLevel}
        scanPeriod={1000}
        onResult={onResult}
      />
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
      <HStack borderColor="blackAlpha.100" borderWidth={2} p={4} my={5}>
        <Text fontWeight="bold">By Label</Text>
        <FormControl isInvalid={!!boxLabelInputError}>
          <Input
            type="string"
            width={150}
            onChange={(e) => onBoxLabelInputChange(e.currentTarget.value)}
            disabled={findBoxByLabelIsLoading}
            value={boxLabelInputValue}
          />
          <FormErrorMessage>{boxLabelInputError}</FormErrorMessage>
        </FormControl>
        <Button
          disabled={!!boxLabelInputError || findBoxByLabelIsLoading}
          isLoading={findBoxByLabelIsLoading}
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
    </Container>
  );
}

export default QrReader;
