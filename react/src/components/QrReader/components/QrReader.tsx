import { useCallback, useMemo, useState } from "react";
import { Result } from "@zxing/library";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon, SearchIcon } from "@chakra-ui/icons";
import { OnResultFunction, QrReaderScanner } from "./QrReaderScanner";
import { ViewFinder } from "./ViewFinder";
import QrReaderMultiBox from "./QrReaderMultiBox";

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
    <>
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
      <Tabs>
        <TabList justifyContent="center">
          <Tab>SOLO BOX</Tab>
          <Tab>MULTI BOX</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <FormControl isInvalid={!!boxLabelInputError}>
              <FormLabel>Find Box</FormLabel>
              <InputGroup borderRadius={0}>
                <Input
                  type="string"
                  onChange={(e) => onBoxLabelInputChange(e.currentTarget.value)}
                  disabled={findBoxByLabelIsLoading}
                  value={boxLabelInputValue}
                  borderRadius={0}
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Find box By label"
                    icon={<SearchIcon />}
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
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{boxLabelInputError}</FormErrorMessage>
            </FormControl>
          </TabPanel>
          <TabPanel px={0}>
            <QrReaderMultiBox />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}

export default QrReader;
