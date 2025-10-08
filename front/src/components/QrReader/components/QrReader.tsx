import { useCallback, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Result } from "@zxing/library";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
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
import { SearchIcon } from "@chakra-ui/icons";
import { useHasPermission } from "hooks/hooks";
import { QrReaderScanner, QrReaderScannerHandle } from "./QrReaderScanner";
import QrReaderMultiBoxContainer from "./QrReaderMultiBoxContainer";

export interface IQrReaderProps {
  isMultiBox: boolean;
  findBoxByLabelIsLoading: boolean;
  onTabSwitch: (index: number) => void;
  onScan: (result: string, multiScan: boolean) => void;
  onFindBoxByLabel: (label: string) => void;
}

export type QrReaderHandle = {
  stopCamera: () => Promise<void>;
};

const QrReader = forwardRef<QrReaderHandle, IQrReaderProps>(
  ({ isMultiBox, findBoxByLabelIsLoading, onTabSwitch, onScan, onFindBoxByLabel }, ref) => {
    const hasManageInventoryPermission = useHasPermission("manage_inventory");
    const qrReaderScannerRef = useRef<QrReaderScannerHandle>(null);

    // Expose stopCamera function to parent component
    useImperativeHandle(ref, () => ({
      stopCamera: async () => {
        if (qrReaderScannerRef.current) {
          await qrReaderScannerRef.current.stopCamera();
        }
      },
    }));

    // Zoom
    const [zoomLevel] = useState(1);

    // Did the QrReaderScanner catch a QrCode? --> call onScan with text value
    const onResult = useCallback(
      (multiScan: boolean, qrReaderResult: Result | undefined | null) => {
        if (qrReaderResult) {
          onScan(qrReaderResult.getText(), multiScan);
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
          ref={qrReaderScannerRef}
          key="qrReaderScanner"
          multiScan={isMultiBox && hasManageInventoryPermission}
          facingMode="environment"
          zoom={zoomLevel}
          scanPeriod={1000}
          onResult={onResult}
        />
        <Tabs index={isMultiBox && hasManageInventoryPermission ? 1 : 0} onChange={onTabSwitch}>
          <TabList justifyContent="center">
            <Tab>SOLO BOX</Tab>
            <Tab isDisabled={!hasManageInventoryPermission}>MULTI BOX</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <FormControl isInvalid={!!boxLabelInputError}>
                <FormLabel>Find Box</FormLabel>
                <InputGroup borderRadius={0}>
                  <Input
                    type="string"
                    onChange={(e) => onBoxLabelInputChange(e.currentTarget.value)}
                    isDisabled={findBoxByLabelIsLoading}
                    value={boxLabelInputValue}
                    borderRadius={0}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Find box By label"
                      icon={<SearchIcon />}
                      isDisabled={!!boxLabelInputError || findBoxByLabelIsLoading}
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
              {hasManageInventoryPermission && <QrReaderMultiBoxContainer />}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </>
    );
  },
);

QrReader.displayName = "QrReader";

export default QrReader;
