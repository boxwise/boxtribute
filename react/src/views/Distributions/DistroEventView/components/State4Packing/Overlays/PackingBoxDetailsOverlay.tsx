import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Flex,
  Text,
  FormControl,
  Input,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";

interface ModalProps {
  isBoxDetailOpen: boolean;
  onBoxDetailClose: () => void;
}

export interface BoxData {
  id: string;
  labelIdentifier: string;
  productName: string;
  size?: string;
  numberOfItems: number;
}

export interface PackingActionProps {
  onBoxToDistribution: (boxId: string) => void;
  onMoveItemsToDistribution: (boxId: string, inputNumber: number) => void;
}

export interface StateProps {
  isMovingItems: boolean;
  setIsMovingItems: (isMovingItems: boolean) => void;
}

interface PackingBoxDetailsProps {
  modalProps: ModalProps;
  boxData: BoxData;
  packingActionProps: PackingActionProps;
  itemsForPackingNumberOfItems: number;
  stateProps: StateProps;
}

const PackingBoxDetailsOverlay = ({
  modalProps,
  boxData,
  packingActionProps,
  itemsForPackingNumberOfItems,
  stateProps,
}: PackingBoxDetailsProps) => {
  const [inputNumber, setInputNumber] = useState(0);

  const onClose = useCallback(() => {
    stateProps.setIsMovingItems(false);
    modalProps.onBoxDetailClose();
  }, [modalProps, stateProps]);

  const toast = useToast({
    position: "bottom",
    title: "Container style is updated",
    containerStyle: {
      width: "800px",
      maxWidth: "90%",
      borderRadius: "0px",
    },
  });

  return (
    <>
      <Modal isOpen={modalProps.isBoxDetailOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader mx={4} pb={0}>
            Box Details
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody mx={4}>
            <Flex direction="column">
              <Flex direction="row" justifyContent="space-between">
                <Flex key={boxData.id} direction="column">
                  <Text fontSize="xl">{boxData.labelIdentifier}</Text>
                  <Text fontSize="xl">{boxData.productName}</Text>
                  <Text mb={4} fontSize="md">
                    {boxData.size} x {boxData.numberOfItems}
                  </Text>
                </Flex>
               <Flex direction="column">
                  <Text fontSize="xl">To Pack:</Text>
                  <Text>{itemsForPackingNumberOfItems} items</Text>
                </Flex>
              </Flex>
              {!stateProps.isMovingItems ? (
                <Button
                  my={2}
                  onClick={() => {
                    packingActionProps.onBoxToDistribution(boxData.id);
                    onClose();
                    toast({
                      title: "Done!",
                      description: "Box moved to the distribution.",
                      status: "success",
                      duration: 2000,
                      isClosable: true,
                    });
                  }}
                  colorScheme="blue"
                >
                  Move box to the distribution
                </Button>
              ) : null}

              <Flex my={2} direction="column">
                <Button
                  variant="outline"
                  onClick={() => {
                    stateProps.setIsMovingItems(true);
                  }}
                  colorScheme="blue"
                >
                  Move items to the distribution
                </Button>
                {stateProps.isMovingItems ? (
                  <FormControl
                    onSubmit={() => {
                      packingActionProps.onMoveItemsToDistribution(
                        boxData.id,
                        inputNumber
                      );
                    }}
                  >
                    <Flex my={4} alignItems="center">
                      {" "}
                      <Input
                        type="number"
                        mr={2}
                        w="50%"
                        placeholder="Number of items"
                        max={boxData.numberOfItems}
                        min="1"
                        name="inputdata"
                        onChange={(e) => {
                          setInputNumber(parseInt(e.target.value));
                        }}
                      />
                      <Text mr={2}>out of {boxData.numberOfItems}</Text>
                    </Flex>
                    <Button
                      colorScheme="blue"
                      type="submit"
                      onClick={() => {
                        onClose();
                        toast({
                          title: "Done!.",
                          description: "Items moved to the distribution.",
                          status: "success",
                          duration: 2000,
                          isClosable: true,
                        });
                      }}
                    >
                      Move
                    </Button>
                  </FormControl>
                ) : null}
              </Flex>
            </Flex>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
};

export default PackingBoxDetailsOverlay;
