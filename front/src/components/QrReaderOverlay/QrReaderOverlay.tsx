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
        <div className="flex flex-row justify-end">
          <ModalHeader>Boxtribute QR Scanner</ModalHeader>
          <ModalCloseButton />
        </div>
        <ModalBody>
          <QrReaderContainer onSuccess={onClose} />
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Close QR Scanner
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default QrReaderOverlay;
