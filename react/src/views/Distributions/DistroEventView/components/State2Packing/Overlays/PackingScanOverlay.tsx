import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Flex,
} from "@chakra-ui/react";
import QrScanner from "components/QrScanner/QrScanner";
import { useState } from "react";

interface ModalProps {
  isScanOpen: boolean;
  onScanClose: () => void;
  onBoxDetailOpen: () => void;
}

interface ScanOverlayProps {
  modalProps: ModalProps;
}

const PackingScanOverlay = ({ modalProps }: ScanOverlayProps) => {
  const [manualBoxLabel, setManualBoxLabel] = useState(false);
  const [manualBoxLabelValue, setManualBoxLabelValue] = useState(0);
  return (
    <>
      <Modal
        isOpen={modalProps.isScanOpen}
        onClose={() => {
          modalProps.onScanClose();
          setManualBoxLabel(false);
        }}
      >
        <ModalOverlay />
        <ModalContent top="0">
          <ModalHeader pb={0}>Scan the box</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <QrScanner />
          </ModalBody>
          <Button
            onClick={() => {
              modalProps.onScanClose();
              modalProps.onBoxDetailOpen();
              setManualBoxLabel(false);
            }}
            colorScheme="blue"
            mx={10}
            mb={4}
          >
            Mocked scanned box
          </Button>
          <Button
            onClick={() => setManualBoxLabel(true)}
            colorScheme="blue"
            variant="outline"
            mx={10}
            mb={4}
          >
            Find Box by Label
          </Button>
          {manualBoxLabel ? (
            <Flex mx={10} mb={4} justifyContent="space-between">
              <Input
                type="number"
                mr={2}
                w="50%"
                placeholder="Box Label"
                name="inputData"
                onChange={(e) => {
                  setManualBoxLabelValue(parseInt(e.target.value));
                }}
              />
              <Button
                onClick={() => {
                  modalProps.onScanClose();
                  modalProps.onBoxDetailOpen();
                  setManualBoxLabel(false);
                }}
                colorScheme="blue"
              >
                Search
              </Button>
            </Flex>
          ) : null}
          <Button colorScheme="blue" variant="outline" mx={10}>
            Other source
          </Button>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
};

export default PackingScanOverlay;
