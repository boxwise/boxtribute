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
import { AddIcon } from "@chakra-ui/icons";
import { groupBy } from "utils/helpers";
import { useCallback, useState } from "react";
import { IPackingListEntry } from "views/Distributions/types";
import PackingScanBoxOrFindByLabelOverlay from "./Overlays/PackingScanBoxOrFindByLabelOverlay";

interface DistroEventDetailsForPackingStateProps {
  packingListEntries: IPackingListEntry[];
  // onShowListClick: (itemId: string) => void;
  // boxesData: BoxData[];
  // boxData: BoxData;
  // packingActionProps: PackingActionProps;
  // packingActionListProps: PackingActionListProps;
}

const PackingListEntry = ({
  packingListEntry,
}: {
  packingListEntry: IPackingListEntry;
}) => {
  const [chosenPackingNumberOfItems, setChosenPackingNumberOfItems] =
    useState(0);
  const {
    isOpen: isListOpen,
    onClose: onListClose,
    onOpen: onListOpen,
  } = useDisclosure();
  const {
    isOpen: isScanOpen,
    onClose: onScanClose,
    onOpen: onScanOpen,
  } = useDisclosure();

  const onBoxSelect = useCallback((boxId: string) => {
    onScanClose();
    alert(`Selected box ${boxId}`);
  }, [onScanClose]);


  console.log("FOO: packingListEntry", packingListEntry);

  return (
    <>
      <AccordionPanel py={0}>
        <Flex
          alignItems="center"
          borderTop="1px"
          borderColor="gray.300"
          direction="row"
          pl={6}
          onClick={() =>
            setChosenPackingNumberOfItems(packingListEntry.numberOfItems)
          }
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
            {packingListEntry.numberOfItems} x {packingListEntry.size?.label}
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

      <PackingScanBoxOrFindByLabelOverlay
        isScanOpen={isScanOpen}
        onScanClose={onScanClose}
        onBoxSelect={onBoxSelect}
        packingListEntry={packingListEntry}
    />
    </>
  );
};

const DistroEventDetailsForPackingState = ({
  packingListEntries,
}: // boxesData,
// onShowListClick,
// boxData,
// packingActionProps,
// packingActionListProps,
DistroEventDetailsForPackingStateProps) => {
  const itemsForPackingGroupedByProductName = groupBy(
    packingListEntries,
    (item) => item.product.name
  );

  //TO DO Sort the sizes by size order
  const itemsForPackingSorted = Object.keys(
    itemsForPackingGroupedByProductName
  ).map((key) => {
    return {
      productName: key,
      items: itemsForPackingGroupedByProductName[key],
    };
  });

  const {
    isOpen: isBoxDetailOpen,
    onClose: onBoxDetailClose,
    onOpen: onBoxDetailOpen,
  } = useDisclosure();

  const [isMovingItems, setIsMovingItems] = useState(false);

  return (
    <>
      <Center>
        <Accordion w={[300, 420, 500]} allowToggle>
          {itemsForPackingSorted.map((item, i) => {
            return (
              <AccordionItem w={[300, 420, 500]} justifyItems="center" key={i}>
                <Flex justifyItems="center">
                  <AccordionButton zIndex="2">
                    <Box flex="1" textAlign="center">
                      <strong>{item.productName}</strong>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </Flex>
                {item.items.map((item) => (
                  <PackingListEntry packingListEntry={item} key={item.id} />
                ))}
              </AccordionItem>
            );
          }, [])}
        </Accordion>
      </Center>
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
