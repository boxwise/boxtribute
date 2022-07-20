import { DeleteIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Flex,
  Text,
  IconButton,
  Box,
} from "@chakra-ui/react";
import { BoxData } from "./PackingBoxDetailsOverlay";

interface ModalProps {
  isListOpen: boolean;
  onListClose: () => void;
}

export interface PackingActionListProps {
  onDeleteBoxFromDistribution: (boxId: string) => void;
}

interface PackedListOverlayProps {
  modalProps: ModalProps;
  boxesData: BoxData[];
  packingActionProps: PackingActionListProps;
}

const PackedListOverlay = ({
  modalProps,
  boxesData,
  packingActionProps,
}: PackedListOverlayProps) => {
  return (
    <>
      <Modal isOpen={modalProps.isListOpen} onClose={modalProps.onListClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader mx={4} pb={0}>
            Packed Boxes and Items
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody mx={4}>
            <Flex direction="column" >
              {boxesData.map((box) => (
                <Flex alignItems='center' borderBottom='1px' borderColor='gray.300' my={2} key={box.id} justifyContent='space-between'>
                  <Flex direction="row">
                  <Text mr={4}>{box.labelIdentifier}</Text>
                  <Text> number of items: {box.numberOfItems}</Text>
                  </Flex>
                  <Box>
                  <IconButton
                    _hover={{
                      backgroundColor: "transparent",
                      opacity: "0.5",
                    }}
                    backgroundColor="transparent"
                    aria-label="Delete"
                    color="teal"
                    icon={<DeleteIcon />}
                    onClick={() =>
                      packingActionProps.onDeleteBoxFromDistribution(box.id)
                    }
                  />
                  </Box>
                </Flex>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
};

export default PackedListOverlay;
