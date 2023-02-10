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
  header: string;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;
}

function YesNoOverlay({ header, isLoading, isOpen, onClose, onYes, onNo }: IYesNoOverlayProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="0">
        <ModalHeader>{header}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex py={1} px={1} alignItems="center" gap={1}>
            Placeholder for text in details
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button px={6} borderRadius="0" isLoading={isLoading}>
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default TakeItemsFromBoxOverlay;
