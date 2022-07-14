import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Box,
  Flex,
  useDisclosure,
  IconButton,
  Button,
  Center,
} from "@chakra-ui/react";
import { AddIcon} from "@chakra-ui/icons";
import { groupBy } from "utils/helpers";
import { useCallback, useState } from "react";
import { PackingListEntry } from "views/Distributions/types";
import PackingBoxDetailsOverlay, { BoxData, PackingActionProps } from "../State2Packing/Overlays/PackingBoxDetailsOverlay";
import PackedListOverlay, { PackingActionListProps } from "../State2Packing/Overlays/PackedListOverlay";
import PackingScanBoxOrFindByLabelOverlay from "./Overlays/PackingScanBoxOrFindByLabelOverlay";

interface DistroEventDetailsForPackingStateProps {
  packingListEntries: PackingListEntry[];
  // onShowListClick: (itemId: string) => void;
  // boxesData: BoxData[];
  // boxData: BoxData;
  // packingActionProps: PackingActionProps;
  // packingActionListProps: PackingActionListProps;
}

const DistroEventDetailsForPackingState = ({
  packingListEntries,
  // boxesData,
  // onShowListClick,
  // boxData,
  // packingActionProps,
  // packingActionListProps,
}: DistroEventDetailsForPackingStateProps) => {

  const itemsForPackingGroupedByProductName = groupBy(
    packingListEntries,
    (item) => item.productName
  );

  //TO DO Sort the sizes by size order
  const itemsForPackingSorted = Object.keys(
    itemsForPackingGroupedByProductName
  ).map((key) => {
    return {
      productName: key,
      items: itemsForPackingGroupedByProductName[key].map((item) => ({
        numberOfItems: item.numberOfItems,
        size: item.size,
        id: item.id,
        productName: item.productName,
      })),
    };
  });

  const {
    isOpen: isScanOpen,
    onClose: onScanClose,
    onOpen: onScanOpen,
  } = useDisclosure();
  const {
    isOpen: isBoxDetailOpen,
    onClose: onBoxDetailClose,
    onOpen: onBoxDetailOpen,
  } = useDisclosure();
  const {
    isOpen: isListOpen,
    onClose: onListClose,
    onOpen: onListOpen,
  } = useDisclosure();

  const [chosenPackingNumberOfItems, setChosenPackingNumberOfItems] = useState(0);
  const [isMovingItems, setIsMovingItems] = useState(false);

  const onBoxSelect = useCallback((boxId: string) => {
    onScanClose();
    alert(`Selected box ${boxId}`);
  }, []);

  return (
    <>
        <Center>
        <Accordion w={[300, 420, 500]} allowToggle>
          {itemsForPackingSorted.map((item) => {
            return (
              <AccordionItem w={[300, 420, 500]} justifyItems="center">
                <Flex justifyItems="center">
                  <AccordionButton zIndex="2">
                    <Box flex="1" textAlign="center">
                      <strong>{item.productName}</strong>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </Flex>
                {item.items.map((item) => {
                  return (
                    <AccordionPanel py={0}>
                      <Flex
                        alignItems="center"
                        borderTop="1px"
                        borderColor="gray.300"
                        direction="row"
                        pl={6}
                        onClick={() => setChosenPackingNumberOfItems(item.numberOfItems)}
                        >
                        <Box
                          as={Button}
                          backgroundColor="transparent"
                          borderRadius="0px"
                          flex="1"
                          onClick={() => {
                            onListOpen();
                            // onShowListClick(item.id);
                          }}
                          _hover={{
                            backgroundColor: "transparent",
                            opacity: "0.5",
                          }}
                        >
                          {item.numberOfItems} x {item.size?.label}
                        </Box>
                        <Box>
                          <IconButton
                            _hover={{
                              backgroundColor: "transparent",
                              opacity: "0.5",
                            }}
                            backgroundColor="transparent"
                            aria-label="Add items"
                            icon={<AddIcon />}
                            onClick={(e) => {
                              onScanOpen();
                            }}
                            color="teal"
                          />
                        </Box>
                      </Flex>
                    </AccordionPanel>
                  );
                })}
              </AccordionItem>
            );
          }, [])}
        </Accordion>
        </Center>
      <PackingScanBoxOrFindByLabelOverlay
          isScanOpen={isScanOpen}
          onScanClose={onScanClose}
          onBoxSelect={onBoxSelect}
          // onBoxDetailOpen: onBoxDetailOpen,
      />
      {/* <PackingBoxDetailsOverlay
        modalProps={{ isBoxDetailOpen: isBoxDetailOpen, onBoxDetailClose: onBoxDetailClose }}
        boxData={boxData}
        // packingActionProps={packingActionProps}
        itemsForPackingNumberOfItems={chosenPackingNumberOfItems}
        stateProps={{
          isMovingItems,
          setIsMovingItems,
        }}
      /> */}
      {/* <PackedListOverlay
        modalProps={{ isListOpen, onListClose }}
        boxesData={boxesData}
        // packingActionProps={packingActionListProps}
      /> */}
    </>
  );
};
export default DistroEventDetailsForPackingState;
