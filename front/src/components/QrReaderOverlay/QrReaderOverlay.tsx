import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
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
    <Modal isOpen={isOpen} closeOnOverlayClick={false} closeOnEsc onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader display="flex" justifyContent="space-between" alignItems="center">
          Boxtribute QR Scanner
          <ModalCloseButton position="static" />
        </ModalHeader>
        <ModalBody>
          <QrReaderContainer onSuccess={onClose} />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close QR Scanner</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default QrReaderOverlay;
