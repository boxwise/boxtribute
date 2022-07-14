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
import QrScanner from "components/QrScanner";
import { useState } from "react";

interface ScanOverlayProps {
  isScanOpen: boolean;
  onScanClose: () => void;
  onBoxSelect: (boxId: string) => void;
}

const PackingScanBoxOrFindByLabelOverlay = ({ onBoxSelect, isScanOpen, onScanClose }: ScanOverlayProps) => {
  const [showFindBoxByLabelForm, setShowFindBoxByLabelForm] = useState(false);
  const [manualBoxLabelValue, setManualBoxLabelValue] = useState(0);
  return (
    <Modal
      isOpen={isScanOpen}
      onClose={() => {
        onScanClose();
        setShowFindBoxByLabelForm(false);
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
            onScanClose();
            onBoxSelect("728798")
            setShowFindBoxByLabelForm(false);
          }}
          colorScheme="blue"
          mx={10}
          mb={4}
        >
          Mocked scanned box
        </Button>
        <Button
          onClick={() => setShowFindBoxByLabelForm(true)}
          colorScheme="blue"
          variant="outline"
          mx={10}
          mb={4}
        >
          Find Box by Label
        </Button>
        {showFindBoxByLabelForm ? (
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
                onScanClose();
                // modalProps.onBoxDetailOpen();
                // setShowFindBoxByLabelForm(false);
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
  );
};

export default PackingScanBoxOrFindByLabelOverlay;
