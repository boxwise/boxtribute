import { QrReader } from "react-qr-reader";
import {
  Button,
  Checkbox,
  Container,
  HStack,
  List,
  ListItem,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";

export interface QrScannerProps {
  scannedQrValues: string[];
  onBulkScanningDone: () => void;
  // bulkModeActive: boolean;
  // onToggleBulkMode: () => void;
  onResult: (qrValue: string) => void;
}
const QrScanner = ({
  scannedQrValues,
  onBulkScanningDone,
  // bulkModeActive,
  // onToggleBulkMode,
  onResult,
}: QrScannerProps) => {
  const [isBulkModeActive, setIsBulkModeActive] = useState(false);

  const onToggleBulkMode = () => setIsBulkModeActive(prev => !prev)

  return (
    <Container maxW="md">
      <QrReader
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
      <HStack>
        <Button onClick={onToggleBulkMode}>Bulk Mode</Button>
        <HStack>
          <Button>-</Button>
          <Button>+</Button>
        </HStack>
      </HStack>
      {isBulkModeActive && (
        <VStack>
          <VStack spacing={5} direction="row">
            {scannedQrValues.map((qrCode, i) => (
              <Checkbox key={i} colorScheme="green" defaultChecked>
                {qrCode}
              </Checkbox>
            ))}
          </VStack>
          <Button>Scanning done</Button>
        </VStack>
      )}
    </Container>
  );
};

export default QrScanner;
