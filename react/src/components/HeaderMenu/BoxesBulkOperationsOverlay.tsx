import {
  Box,
  Button,
  Container,
  Text,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
  Heading,
} from "@chakra-ui/react";
import { IBoxDetailsData } from "utils/base-types";

interface BoxesBulkOperationsOverlayProps {
  handleClose: () => void;
  isOpen: boolean;
  boxesData: IBoxDetailsData[];
}

const BoxesBulkOperationsOverlay = ({
  isOpen,
  handleClose,
  boxesData,
}: BoxesBulkOperationsOverlayProps) => {
  return (
    <Modal
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
            <Heading as="h3" size="md">
              Selected Boxes
            </Heading>
            <List>
              {boxesData.map((boxData) => (
                <ListItem mb={3} backgroundColor="gray.50" p={3}>
                  <Box>
                    <Text>
                      <b>Product: </b>
                      {boxData.product?.name}
                    </Text>
                  </Box>
                  <Box>
                    <Text>
                      <b>Size: </b>
                      {boxData.size?.label}
                    </Text>
                  </Box>
                  <Box>
                    <Text>
                      <b>Location: </b> {boxData.place?.name}
                    </Text>
                  </Box>
                  <Box>
                    <Text>
                      <b>Distribution Event: </b>
                      Placeholder
                    </Text>
                  </Box>
                  <Box>
                    <Text>
                      <b>Number of items on distro: </b>
                      {boxData.numberOfItems}
                    </Text>
                  </Box>
                </ListItem>
              ))}
            </List>
            <Box>
              <Heading as="h3" size="md">
                Operation
              </Heading>
              <Text>What do you want to do with these boxes?</Text>
              <VStack>
                <Box mt={10}>
                  <Heading as="h4" size="sm">
                    Move to location
                  </Heading>
                </Box>
                <Box mt={10}>
                  <Heading as="h4" size="sm">
                    Change State
                  </Heading>
                </Box>
                <Box mt={10}>
                  <Heading as="h4" size="sm">
                    Assign to Distribution Event
                  </Heading>
                </Box>
                <Box mt={10}>
                  <Heading as="h4" size="sm">
                    Apply tag
                  </Heading>
                </Box>
              </VStack>
            </Box>
          </Container>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={handleClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BoxesBulkOperationsOverlay;
