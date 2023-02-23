import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import QrReaderContainer from "components/QrReader/QrReaderContainer";

export interface IQrReaderOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

function QrReaderOverlay({ isOpen, onClose }: IQrReaderOverlayProps) {
  return (
    <Modal isOpen={isOpen} closeOnOverlayClick closeOnEsc onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>QR Scanner</ModalHeader>
        <ModalBody>
          <QrReaderContainer />
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default QrReaderOverlay;
