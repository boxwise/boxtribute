import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import QrScanner from "components/QrScanner";

interface ModalProps {
  isScanOpen: boolean;
  onScanClose: () => void;
}

interface ScanOverlayProps {
  modalProps: ModalProps;
}

const ScanOverlay = ({ modalProps }: ScanOverlayProps) => {
  return (
    <Modal isOpen={modalProps.isScanOpen} onClose={modalProps.onScanClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign="center" mx={4} pb={0}>
          Everything is Distributed
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody mx={4}></ModalBody>
        <Flex direction="column" alignItems="center">
          <Text fontSize="2xl">Scan QR Code</Text>
          <QrScanner />
          <Button colorScheme="blue" mx={10} mb={4}>
            Find box by label
          </Button>
        </Flex>
      </ModalContent>
    </Modal>
  );
};
export default ScanOverlay;
