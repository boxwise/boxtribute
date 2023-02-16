import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Button,
  Flex,
  Spacer,
} from "@chakra-ui/react";

interface IYesNoOverlayProps {
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

function TransferAgreementsOverlay({ isLoading, isOpen, onClose }: IYesNoOverlayProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="0">
        <ModalHeader>Test</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex py={1} px={1} alignItems="center" gap={1}>
            Placeholder for text in details
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button variant="green" isLoading={isLoading}>
            Left
          </Button>
          <Button variant="red" isLoading={isLoading}>
            Right
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default TransferAgreementsOverlay;
