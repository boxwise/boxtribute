import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Flex,
} from "@chakra-ui/react";
import QrScanner from "components/QrScanner";
import { useState } from "react";

interface ModalProps {
  isFirstOpen: boolean;
  onFirstClose: () => void;
  onSecondOpen: () => void;
}

interface FirstOverlayProps {
  modalProps: ModalProps;
}

const PackingScanOverlay = ({ modalProps }: FirstOverlayProps) => {
  const [manualBoxLabel, setManualBoxLabel] = useState(false);
  const [manualBoxLabelValue, setManualBoxLabelValue] = useState(0);
  return (
    <>
      <Modal isOpen={modalProps.isFirstOpen} onClose={modalProps.onFirstClose}>
        <ModalOverlay />
        <ModalContent top='0'>
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
            onClick={() => setManualBoxLabel(true)}
            colorScheme="blue"
            variant='outline'
            mx={10}
            mb={4}
          >
            Write Box Label
          </Button>
          {manualBoxLabel ? (
            <Flex mx={10} mb={4} justifyContent="space-between">
            <Input
            type="number"
            mr={2}
            w="50%"
            placeholder="Box Label"
            name="inputData"
            onChange={(e) => {
              setManualBoxLabelValue(parseInt(e.target.value));
            }}
          />
          <Button onClick={() => {  
            modalProps.onFirstClose();
            modalProps.onSecondOpen();
            setManualBoxLabel(false);
          }
          }
          colorScheme="blue"
          >
            Search
          </Button>
          </Flex>
          ) : null}
          <Button
            // onClick={modalProps.onOtherSource}
            colorScheme="blue"
            variant='outline'
            mx={10}
          >
            Other source
          </Button>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
};

export default PackingScanOverlay;
