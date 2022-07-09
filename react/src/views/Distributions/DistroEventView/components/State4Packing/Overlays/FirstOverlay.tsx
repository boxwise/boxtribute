import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import QrScanner from "components/QrScanner";

interface ModalProps {
  isFirstOpen: boolean;
  onFirstClose: () => void;
  onFirstOpen: () => void;
  onSecondOpen: () => void;
  // onOtherSource: () => void;
}

interface FirstOverlayProps {
  modalProps: ModalProps;
}

const FirstOverlay = ({ modalProps }: FirstOverlayProps) => {
  return (
    <>
      <Modal isOpen={modalProps.isFirstOpen} onClose={modalProps.onFirstClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader pb={0}>Scan the box</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <QrScanner />
          </ModalBody>
          <Button
            onClick={() => {
              modalProps.onFirstClose();
              modalProps.onSecondOpen();
            }}
            colorScheme="blue"
            mx={10}
            mb={4}
          >
            Mocked scanned box
          </Button>
          <Button
            // onClick={modalProps.onOtherSource}
            colorScheme="blue"
            variant='outline'
            mx={10}
          >
            Other source
          </Button>
          <ModalFooter />
          {/* <Button onClick={modalProps.onClose}>Cancel</Button>
          </ModalFooter> */}
        </ModalContent>
      </Modal>
    </>
  );
};

export default FirstOverlay;
