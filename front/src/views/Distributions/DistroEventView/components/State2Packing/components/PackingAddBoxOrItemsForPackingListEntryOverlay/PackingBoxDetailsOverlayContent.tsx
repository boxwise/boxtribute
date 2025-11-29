import { Button, Flex, Input, Dialog, Text } from "@chakra-ui/react";
import { useState } from "react";
import { BoxData } from "views/Distributions/types";

export interface PackingActionProps {
  onBoxToDistribution: (boxId: string) => void;
  onMoveItemsToDistribution: (boxId: string, inputNumber: number) => void;
}

export interface StateProps {
  isMovingItems: boolean;
  setIsMovingItems: (isMovingItems: boolean) => void;
}

interface PackingBoxDetailsProps {
  // modalProps: ModalProps;
  boxData: BoxData;
  // open: boolean;
  // onClose: () => void;
  // packingActionProps: PackingActionProps;
  targetNumberOfItemsToPack: number;
  onAddBoxToDistributionEvent: (boxId: string) => void;
  onAddIndividualItemsToDistribution: (boxId: string, numberOfItemsToMove: number) => void;
  // stateProps: StateProps;
}

const PackingBoxDetailsOverlayContent = ({
  // modalProps,
  boxData,
  onAddBoxToDistributionEvent,
  onAddIndividualItemsToDistribution,
  // open,
  // onClose,
  // packingActionProps,
  targetNumberOfItemsToPack,
  // stateProps,
}: PackingBoxDetailsProps) => {
  const [numberOfItemsToMove, setNumberOfItemsToMove] = useState(0);
  const [isMoveIndividualItemsToDistributionMode, setIsMoveIndividualItemsToDistributionMode] =
    useState(false);

  // const onClose = useCallback(() => {
  //   // stateProps.setIsMovingItems(false);
  //   // modalProps.onBoxDetailClose();
  // }, []);

  return (
    <Dialog.Positioner>
      <Dialog.Content>
        <Dialog.Header mx={4} pb={0}>
          Box Details
        </Dialog.Header>
        <Dialog.CloseTrigger />
        <Dialog.Body mx={4}>
          <Flex direction="column">
            <Flex direction="row" justifyContent="space-between">
              <Flex key={boxData.labelIdentifier} direction="column">
                <Text fontSize="xl">{boxData.labelIdentifier}</Text>
                <Text fontSize="xl">{boxData.product?.name}</Text>
                <Text mb={4} fontSize="md">
                  {boxData.size?.label} x {boxData.numberOfItems}
                </Text>
              </Flex>
              <Flex direction="column">
                <Text fontSize="xl">To Pack:</Text>
                <Text>{targetNumberOfItemsToPack} items</Text>
              </Flex>
            </Flex>
            {!isMoveIndividualItemsToDistributionMode && (
              <Button
                my={2}
                onClick={() => {
                  // packingActionProps.onBoxToDistribution(boxData.id);
                  // onClose();
                  onAddBoxToDistributionEvent(boxData.labelIdentifier);
                }}
                colorPalette="blue"
              >
                Move box to the distribution
              </Button>
            )}

            <Flex my={2} direction="column">
              <Button
                variant="outline"
                onClick={() => {
                  setIsMoveIndividualItemsToDistributionMode(true);
                }}
                colorPalette="blue"
              >
                Move items to the distribution
              </Button>
              {isMoveIndividualItemsToDistributionMode ? (
                <form
                  onSubmit={() => {
                    // packingActionProps.onMoveItemsToDistribution(
                    //   boxData.id,
                    //   inputNumber
                    // );
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
                        setNumberOfItemsToMove(parseInt(e.target.value));
                      }}
                    />
                    <Text mr={2}>out of {boxData.numberOfItems}</Text>
                  </Flex>
                  <Button
                    colorPalette="blue"
                    type="submit"
                    onClick={() => {
                      onAddIndividualItemsToDistribution(
                        boxData.labelIdentifier,
                        numberOfItemsToMove,
                      );
                    }}
                  >
                    Move
                  </Button>
                </form>
              ) : null}
            </Flex>
          </Flex>
        </Dialog.Body>
        <Dialog.Footer />
      </Dialog.Content>
    </Dialog.Positioner>
  );
};

export default PackingBoxDetailsOverlayContent;
