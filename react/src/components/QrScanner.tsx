import { QrReader } from "react-qr-reader";
import { Container } from "@chakra-ui/react";

export interface QrScannerProps {
  scannedQrValues: string[];
  onBulkScanningDone: () => void;
  bulkModeActive: boolean;
  onToggleBulkMode: () => void;
  onResult: (qrValue: string) => void;
}
const QrScanner = ({ onResult }: QrScannerProps) => {
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
    </Container>
  );
};

export default QrScanner;
