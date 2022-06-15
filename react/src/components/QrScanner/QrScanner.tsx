import {
  Button,
  Checkbox,
  Container,
  HStack,
  List,
  ListItem,
  VStack,
} from "@chakra-ui/react";
import { QrReader } from "components/QrReader/QrReader";
import { useState } from "react";

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

export interface QrScannerProps {
  bulkModeSupported: boolean;
  scannedQrValues: string[];
  onBulkScanningDone: () => void;
  // bulkModeActive: boolean;
  // onToggleBulkMode: () => void;
  onResult: (qrValue: string) => void;
}
const QrScanner = ({
  bulkModeSupported,
  scannedQrValues,
  onBulkScanningDone,
  // bulkModeActive,
  // onToggleBulkMode,
  onResult,
}: QrScannerProps) => {
  const [isBulkModeActive, setIsBulkModeActive] = useState(false);

  const onToggleBulkMode = () => setIsBulkModeActive((prev) => !prev);

  return (
    <Container maxW="md">
      <QrReader
        videoId="video"
        ViewFinder={ViewFinder}
        constraints={{
          facingMode: "environment",
        }}
        scanDelay={1000}
        onResult={(result, error) => {
          if (!!result) {
            onResult(result["text"]);
          }
          if (!!error) {
            console.info(error);
          }
        }}
      />
      {bulkModeSupported && (
        <HStack>
          <Button onClick={onToggleBulkMode}>Bulk Mode</Button>
          <HStack>
            <Button>-</Button>
            <Button>+</Button>
          </HStack>
        </HStack>
      )}
      {bulkModeSupported && isBulkModeActive && (
        <VStack>
          <VStack spacing={5} direction="row">
            {scannedQrValues.map((qrCode, i) => (
              <Checkbox key={i} colorScheme="green" defaultChecked>
                {qrCode}
              </Checkbox>
            ))}
          </VStack>
          <Button onClick={onBulkScanningDone}>Scanning done</Button>
        </VStack>
      )}
    </Container>
  );
};

export default QrScanner;
