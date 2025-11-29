import { useMutation } from "@apollo/client";
import { IoAdd } from "react-icons/io5";
import {
  Accordion,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  DialogRoot,
  DialogBackdrop,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { toaster } from "@boxtribute/shared-components/chakra-v3/Toaster";
import _ from "lodash";
import { useCallback } from "react";
import {
  // MATCHING_PACKED_ITEMS_COLLECTIONS_FOR_PACKING_LIST_ENTRY,
  ASSIGN_BOX_TO_DISTRIBUTION_MUTATION,
  MOVE_ITEMS_TO_DISTRIBUTION_EVENT,
  PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
} from "views/Distributions/queries";
import { IPackingListEntryForPackingState } from "views/Distributions/types";
import PackedContentListOverlayContainer from "./components/PackedContentListOverlayContainer";
import PackingAddBoxOrItemsForPackingListEntryOverlay from "./components/PackingAddBoxOrItemsForPackingListEntryOverlay/PackingAddBoxOrItemsForPackingListEntryOverlay";

interface DistroEventDetailsForPackingStateProps {
  packingListEntries: IPackingListEntryForPackingState[];
  distributionEventId: string;
}

const PackingListEntry = ({
  packingListEntry,
  distributionEventId,
}: {
  packingListEntry: IPackingListEntryForPackingState;
  distributionEventId: string;
}) => {
  const {
    open: isPackedListOverlayOpen,
    onClose: onPackedListOverlayClose,
    onOpen: onListOpen,
  } = useDisclosure();
  const packingAddBoxOrItemsForPackingListEntryOverlayState = useDisclosure();

  const [assignBoxToDistributionEventMutation] = useMutation(ASSIGN_BOX_TO_DISTRIBUTION_MUTATION);

  const [moveItemsToDistributionEventMutation] = useMutation(MOVE_ITEMS_TO_DISTRIBUTION_EVENT);

  const onAddUnboxedItemsToDistributionEvent = useCallback(
    (boxLabelIdentifier: string, numberOfItemsToMove: number) => {
      packingAddBoxOrItemsForPackingListEntryOverlayState.onClose();
      moveItemsToDistributionEventMutation({
        variables: {
          boxLabelIdentifier,
          distributionEventId,
          numberOfItems: numberOfItemsToMove,
        },
        refetchQueries: [
          {
            query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
            variables: {
              distributionEventId: distributionEventId,
            },
          },
        ],
      })
        .then((res) => {
          if (res.errors && res.errors.length !== 0) {
            console.error(
              `GraphQL error while trying to move items from Box (id: ${boxLabelIdentifier}) into Distribution Event (id: ${distributionEventId})`,
              res.errors,
            );
            toaster.create({
              title: "Error",
              description: "Items couldn't be moved to the distribution event.",
              type: "error",
              duration: 2000,
            });
          } else {
            toaster.create({
              title: "Done!",
              description: `${numberOfItemsToMove} items moved to the distribution.`,
              type: "success",
              duration: 2000,
            });
          }
        })
        .catch((err) => {
          console.error(err);
          toaster.create({
            title: "Error",
            description: "Items couldn't be moved to the distribution event.",
            type: "error",
            duration: 2000,
          });
        });
    },
    [
      distributionEventId,
      moveItemsToDistributionEventMutation,
      packingAddBoxOrItemsForPackingListEntryOverlayState,
    ],
  );

  const onAddBoxToDistributionEvent = useCallback(
    (boxLabelIdentifier: string) => {
      packingAddBoxOrItemsForPackingListEntryOverlayState.onClose();
      assignBoxToDistributionEventMutation({
        variables: {
          boxLabelIdentifier,
          distributionEventId,
        },
        refetchQueries: [
          {
            query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
            variables: {
              distributionEventId: distributionEventId,
            },
          },
        ],
      })
        .then((res) => {
          if (res.errors && res.errors.length !== 0) {
            console.error(
              `GraphQL error while trying to move Box (id: ${boxLabelIdentifier}) into Distribution Event (id: ${distributionEventId})`,
              res.errors,
            );
            toaster.create({
              title: "Error",
              description: "Box couldn't be moved to the distribution event.",
              type: "error",
              duration: 2000,
            });
          } else {
            toaster.create({
              title: "Done!",
              description: "Box moved to the distribution event.",
              type: "success",
              duration: 2000,
            });
          }
        })
        .catch((err) => {
          console.error(err);
          toaster.create({
            title: "Error",
            description: "Box couldn't be moved to the distribution event.",
            type: "error",
            duration: 2000,
          });
        });
    },
    [
      distributionEventId,
      assignBoxToDistributionEventMutation,
      packingAddBoxOrItemsForPackingListEntryOverlayState,
    ],
  );

  return (
    <Flex alignItems="center" borderTop="1px" borderColor="gray.300" direction="row" pl={6}>
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
          onClick={() => {
            packingAddBoxOrItemsForPackingListEntryOverlayState.onOpen();
          }}
          color="teal"
        >
          <IoAdd />
        </IconButton>
      </Box>

      <PackingAddBoxOrItemsForPackingListEntryOverlay
        open={packingAddBoxOrItemsForPackingListEntryOverlayState.open}
        onClose={packingAddBoxOrItemsForPackingListEntryOverlayState.onClose}
        packingListEntry={packingListEntry}
        onAddUnboxedItemsToDistributionEvent={onAddUnboxedItemsToDistributionEvent}
        onAddBoxToDistributionEvent={onAddBoxToDistributionEvent}
      />

      <DialogRoot
        open={isPackedListOverlayOpen}
        onOpenChange={(e) => !e.open && onPackedListOverlayClose()}
      >
        <DialogBackdrop />
        <PackedContentListOverlayContainer
          packingListEntry={packingListEntry}
          onDeleteBoxFromDistribution={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      </DialogRoot>
      {/* <PackedListOverlay
        modalProps={{ isListOpen, onListClose }}
        boxesData={boxesData}
        // packingActionProps={packingActionListProps}
      /> */}
    </Flex>
  );
};

const DistroEventDetailsForPackingState = ({
  packingListEntries,
  distributionEventId,
}: // TODO: Group by product.id instead of name (because product name could be repeated)
DistroEventDetailsForPackingStateProps) => {
  const packingListEntriesWithTargetNumberOfItemsBiggerThanZero = packingListEntries.filter(
    (el) => el.numberOfItems > 0,
  );
  const packingListEntriesGroupedByProductName: Record<string, IPackingListEntryForPackingState[]> =
    _.groupBy(packingListEntriesWithTargetNumberOfItemsBiggerThanZero, (item) => item.product.id);

  //TO DO Sort the sizes by size order
  const packingListEntriesGroupedByProductNameAsArray = _(packingListEntriesGroupedByProductName)
    .keys()
    .map((key) => {
      const packingListEntries = packingListEntriesGroupedByProductName[key].map((el) => {
        const actualNumberOfItemsPacked = el.matchingPackedItemsCollections.reduce(
          (acc, cur) => acc + cur.numberOfItems,
          0,
        );
        return {
          ...el,
          actualNumberOfItemsPacked,
        };
      });
      return {
        product: {
          id: key,
          name: packingListEntries[0].product.name,
          gender: packingListEntries[0].product.gender,
        },
        allPackingListEntriesFulfilled: packingListEntries.every(
          (el) => el.actualNumberOfItemsPacked >= el.numberOfItems,
        ),
        packingListEntries: _(packingListEntries)
          .sortBy((el) => (el.actualNumberOfItemsPacked >= el.numberOfItems ? 1 : -1))
          .value(),
      };
    })
    .sortBy((el) => (el.allPackingListEntriesFulfilled ? 1 : -1))
    .value();

  const onAddAdditionalItemsButtonClick = useCallback(() => {
    alert("PLACEHOLDER");
  }, []);

  const onClickScanBoxesForDistroEvent = useCallback(() => {
    alert("SCANNER PLACEHOLDER");
  }, []);

  return (
    <>
      <Button onClick={onClickScanBoxesForDistroEvent}>Scan Boxes for this Distro Event</Button>
      <VStack gap={0}>
        <Heading size="md">Packing List</Heading>
        <Accordion.Root collapsible px={3} py={3}>
          {packingListEntriesGroupedByProductNameAsArray.map(
            (packingEntriesArrayForProductName) => {
              return (
                <Accordion.Item
                  w={[300, 420, 500]}
                  justifyItems="center"
                  value={packingEntriesArrayForProductName.product.id}
                  key={packingEntriesArrayForProductName.product.id}
                  bg={
                    packingEntriesArrayForProductName.allPackingListEntriesFulfilled
                      ? "green.100"
                      : "red.100"
                  }
                >
                  <Flex justifyItems="center">
                    <Accordion.ItemTrigger zIndex="2">
                      {/* <EnoughItemsPackedStateBadge
                        enoughItemsFacked={enoughItemsFacked}
                      /> */}
                      <Box flex="1" textAlign="center">
                        <Text fontSize={"lg"} fontWeight="bold">
                          {packingEntriesArrayForProductName.product.name} (
                          {packingEntriesArrayForProductName.product.gender})
                        </Text>
                      </Box>
                      <Accordion.ItemIndicator />
                    </Accordion.ItemTrigger>
                  </Flex>
                  <Accordion.ItemContent py={0}>
                    {packingEntriesArrayForProductName.packingListEntries.map((item) => (
                      <Box
                        bg={
                          item.actualNumberOfItemsPacked >= item.numberOfItems
                            ? "green.100"
                            : "red.100"
                        }
                        key={item.id}
                      >
                        <PackingListEntry
                          packingListEntry={item}
                          distributionEventId={distributionEventId}
                        />
                      </Box>
                    ))}
                  </Accordion.ItemContent>
                </Accordion.Item>
              );
            },
            [],
          )}
        </Accordion.Root>
        {/* <Button my={2} onClick={() => {}} colorPalette="blue">
          You're all set - move to Distribution Stage.
        </Button> */}
      </VStack>
      <VStack gap={1}>
        <Button onClick={onAddAdditionalItemsButtonClick} size={"sm"}>
          Add additional items to this Distro Event
        </Button>
        <Text fontSize="xs">
          * You can add additional items to this event, even if they are not listed on the Packing
          list.
        </Text>
      </VStack>
    </>
  );
};
export default DistroEventDetailsForPackingState;
