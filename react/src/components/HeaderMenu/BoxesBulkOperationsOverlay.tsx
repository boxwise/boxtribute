import { MinusIcon, AddIcon } from "@chakra-ui/icons";
import { Box, Button, Container, FormControl, FormLabel, HStack, IconButton, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, NumberInput, NumberInputField, Switch, VStack } from "@chakra-ui/react";
import { QrReader } from "components/QrReader/QrReader";
import { ViewFinder } from "components/QrReaderOverlay/QrReaderOverlay";
import { IBoxDetailsData } from "utils/base-types";

interface BoxesBulkOperationsOverlayProps {
    handleClose: () => void;
    isOpen: boolean;
    boxesData: IBoxDetailsData[];
}

const BoxesBulkOperationsOverlay = ({isOpen, handleClose, boxesData}: BoxesBulkOperationsOverlayProps) => {
    return <Modal
    isOpen={isOpen}
    closeOnOverlayClick={true}
    closeOnEsc={true}
    onClose={handleClose}
  >
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Bulk Operations</ModalHeader>
      <ModalBody>
        <Container maxW="md">
        </Container>
      </ModalBody>

      <ModalFooter>
        <Button mr={3} onClick={handleClose}>
          Cancel
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
};

export default BoxesBulkOperationsOverlay;
