import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Flex,
  Text,
  ModalFooter,
  Button,
} from "@chakra-ui/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActionProps {
  onConfirm: () => void;
  onCancel: () => void;
}

interface AllDistributedOverlayProps {
  modalProps: ModalProps;
  actionProps: ActionProps;
}

const AllDistributedOverlay = ({
  modalProps,
  actionProps,
}: AllDistributedOverlayProps) => {
  return (
    <Modal isOpen={modalProps.isOpen} onClose={modalProps.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign="center" mx={4} pb={0}>
          Everything is Distributed
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody mx={4}>
          <Flex direction="column">
            <Text textAlign="center" my={2} fontSize="xl">
              Are you sure you want to mark all the items as distributed?
            </Text>
            <Text textAlign="center" mb={4} color="red.500">
              <strong>
                It can affect the quality of the data if used incorrectly
              </strong>
            </Text>
            <Button
              colorScheme="blue"
              variant="outline"
              mx={10}
              mb={2}
              onClick={actionProps.onConfirm}
            >
              Confirm
            </Button>
            <Button
              colorScheme="blue"
              mx={10}
              mb={2}
              onClick={actionProps.onCancel}
            >
              Cancel
            </Button>
          </Flex>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};
export default AllDistributedOverlay;
