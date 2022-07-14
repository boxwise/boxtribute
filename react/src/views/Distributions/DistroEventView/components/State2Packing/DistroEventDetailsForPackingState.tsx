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
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { groupBy } from "utils/helpers";
import { useCallback, useState } from "react";
import { IPackingListEntry } from "views/Distributions/types";
import PackingScanBoxOrFindByLabelOverlay from "./components/PackingAddBoxOrItemsForPackingListEntryOverlay/PackingScanBoxOrFindByLabelOverlayContent";
import PackingAddBoxOrItemsForPackingListEntryOverlay from "./components/PackingAddBoxOrItemsForPackingListEntryOverlay/PackingAddBoxOrItemsForPackingListEntryOverlay";
import PackedListOverlayContent from "./components/PackedListOverlayContent";

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
  const {
    isOpen: isScanOpen,
    onClose: onScanClose,
    onOpen: onScanOpen,
  } = useDisclosure();

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

      <PackingAddBoxOrItemsForPackingListEntryOverlay
        isOpen={isScanOpen}
        onClose={onScanClose}
        packingListEntry={packingListEntry}
        onAddUnboxedItemsToDistributionEvent={function (): void {
          throw new Error("Function not implemented.");
        }}
        onAddBoxToDistributionEvent={function (boxId: string): void {
          throw new Error("Function not implemented.");
        }}
      />

      <Modal
        isOpen={isPackedListOverlayOpen}
        onClose={onPackedListOverlayClose}
      >
        <ModalOverlay />
        <PackedListOverlayContent boxesData={[]} />
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
