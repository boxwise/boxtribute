import {
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
  // onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
}
const QrScanner = ({
  bulkModeSupported,
  scannedQrValues,
  onBulkScanningDone,
  // bulkModeActive,
  // onToggleBulkMode,
  onResult,
  // onOpen,
  onClose,
  isOpen,
}: QrScannerProps) => {
  const [isBulkModeActive, setIsBulkModeActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const onToggleBulkMode = () => setIsBulkModeActive((prev) => !prev);

  // const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

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
            {bulkModeSupported && isBulkModeActive && (
              <VStack>
                <VStack spacing={5} direction="row">
                  {scannedQrValues.map((qrCode, i) => (
                    <Checkbox key={i} colorScheme="green" defaultChecked>
                      {qrCode}
                    </Checkbox>
                  ))}
                </VStack>
                <Button onClick={onBulkScanningDone} colorScheme="blue">
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
