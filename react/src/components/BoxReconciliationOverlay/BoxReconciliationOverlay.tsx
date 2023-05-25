import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

export interface IBoxReconciliationOverlayData {
  labelIdentifier: string;
}

export interface IBoxReconciliationOverlayProps {
  isOpen: boolean;
  boxReconcilationOverlayData: IBoxReconciliationOverlayData | undefined;
  onClose: () => void;
}

export function BoxReconcilationOverlay({
  isOpen,
  onClose,
  boxReconcilationOverlayData,
}: IBoxReconciliationOverlayProps) {
  return (
    <Modal isOpen={isOpen} closeOnOverlayClick closeOnEsc onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Box {boxReconcilationOverlayData?.labelIdentifier}</ModalHeader>
        <ModalBody />
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
