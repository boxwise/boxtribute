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
  Modal,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { groupBy } from "utils/helpers";
import { useCallback, useState } from "react";
import { IPackingListEntry } from "views/Distributions/types";
import PackingScanBoxOrFindByLabelOverlay from "./components/PackingAddBoxOrItemsForPackingListEntryOverlay/PackingScanBoxOrFindByLabelOverlayContent";
import PackingAddBoxOrItemsForPackingListEntryOverlay from "./components/PackingAddBoxOrItemsForPackingListEntryOverlay/PackingAddBoxOrItemsForPackingListEntryOverlay";
import PackedContentListOverlay from "./components/PackedContentListOverlay";
import PackedContentListOverlayContainer from "./components/PackedContentListOverlayContainer";

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
    isOpen: isPackedListOverlayOpen,
    onClose: onPackedListOverlayClose,
    onOpen: onListOpen,
  } = useDisclosure();
  const packingAddBoxOrItemsForPackingListEntryOverlayState = useDisclosure();

  const toast = useToast();

  const onAddUnboxedItemsToDistributionEvent = useCallback(
    (boxId: string, numberOfItemsToMove: number) => {
      packingAddBoxOrItemsForPackingListEntryOverlayState.onClose();
      toast({
        title: "Done!",
        description: `${numberOfItemsToMove}tems moved to the distribution.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
    [packingAddBoxOrItemsForPackingListEntryOverlayState, toast]
  );

  const onAddBoxToDistributionEvent = useCallback(
    (boxId: string) => {
      packingAddBoxOrItemsForPackingListEntryOverlayState.onClose();
      toast({
        title: "Done!",
        description: "Box moved to the distribution.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
    [packingAddBoxOrItemsForPackingListEntryOverlayState, toast]
  );

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
                packingAddBoxOrItemsForPackingListEntryOverlayState.onOpen();
              }}
              color="teal"
            />
          </Box>
        </Flex>
      </AccordionPanel>

      <PackingAddBoxOrItemsForPackingListEntryOverlay
        isOpen={packingAddBoxOrItemsForPackingListEntryOverlayState.isOpen}
        onClose={packingAddBoxOrItemsForPackingListEntryOverlayState.onClose}
        packingListEntry={packingListEntry}
        onAddUnboxedItemsToDistributionEvent={
          onAddUnboxedItemsToDistributionEvent
        }
        onAddBoxToDistributionEvent={onAddBoxToDistributionEvent}
      />

      <Modal
        isOpen={isPackedListOverlayOpen}
        onClose={onPackedListOverlayClose}
      >
        <ModalOverlay />
        <PackedContentListOverlayContainer packingListEntryId={packingListEntry.id} onDeleteBoxFromDistribution={function (boxId: string): void {
          throw new Error("Function not implemented.");
        } } />
      </Modal>
      {/* <PackedListOverlay
        modalProps={{ isListOpen, onListClose }}
        boxesData={boxesData}
        // packingActionProps={packingActionListProps}
      /> */}
    </>
  );
};

const DistroEventDetailsForPackingState = ({
  packingListEntries,
}: // TODO: Group by product.id instead of name (because product name could be repeated)
DistroEventDetailsForPackingStateProps) => {
  const itemsForPackingGroupedByProductName = groupBy(
    packingListEntries,
    (item) => item.product.name
  );

  //TO DO Sort the sizes by size order
  const packingEntriesArrayGroupedByProductName = Object.keys(
    itemsForPackingGroupedByProductName
  ).map((key) => {
    return {
      productName: key,
      items: itemsForPackingGroupedByProductName[key],
    };
  });

  return (
    <>
      <Center>
        <Accordion w={[300, 420, 500]} allowToggle>
          {packingEntriesArrayGroupedByProductName.map((item, i) => {
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
    </>
  );
};
export default DistroEventDetailsForPackingState;
