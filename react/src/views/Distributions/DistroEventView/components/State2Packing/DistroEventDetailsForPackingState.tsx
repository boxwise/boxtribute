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
  Badge,
} from "@chakra-ui/react";
import { AddIcon, CheckIcon } from "@chakra-ui/icons";
import { groupBy } from "utils/helpers";
import { useCallback, useState } from "react";
import PackedContentListOverlayContainer from "./components/PackedContentListOverlayContainer";
import {
  // MATCHING_PACKED_ITEMS_COLLECTIONS_FOR_PACKING_LIST_ENTRY,
  MOVE_BOX_TO_DISTRIBUTION_MUTATION,
  MOVE_ITEMS_TO_DISTRIBUTION_EVENT,
  PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
} from "views/Distributions/queries";
import {
  MoveBoxToDistributionEventMutation,
  MoveBoxToDistributionEventMutationVariables,
  MoveItemsToDistributionEventMutation,
  MoveItemsToDistributionEventMutationVariables,
} from "types/generated/graphql";
import PackingAddBoxOrItemsForPackingListEntryOverlay from "./components/PackingAddBoxOrItemsForPackingListEntryOverlay/PackingAddBoxOrItemsForPackingListEntryOverlay";
import { useMutation } from "@apollo/client";
import { IPackingListEntry } from "views/Distributions/types";

interface DistroEventDetailsForPackingStateProps {
  packingListEntries: IPackingListEntry[];
  distributionEventId: string;
  // onShowListClick: (itemId: string) => void;
  // boxesData: BoxData[];
  // boxData: BoxData;
  // packingActionProps: PackingActionProps;
  // packingActionListProps: PackingActionListProps;
}

const PackingListEntry = ({
  packingListEntry,
  distributionEventId,
}: {
  packingListEntry: IPackingListEntry;
  distributionEventId: string;
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

  const [moveBoxToDistributionEventMutation] = useMutation<
    MoveBoxToDistributionEventMutation,
    MoveBoxToDistributionEventMutationVariables
  >(MOVE_BOX_TO_DISTRIBUTION_MUTATION);

  const [moveItemsToDistributionEventMutation] = useMutation<
    MoveItemsToDistributionEventMutation,
    MoveItemsToDistributionEventMutationVariables
  >(MOVE_ITEMS_TO_DISTRIBUTION_EVENT);

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
              eventId: distributionEventId,
            },
          },
          // {
          //   query: MATCHING_PACKED_ITEMS_COLLECTIONS_FOR_PACKING_LIST_ENTRY,
          //   variables: {
          //     packingListEntryId: packingListEntry.id,
          //   },
          // },
        ],
      })
        .then((res) => {
          if (res.errors && res.errors.length !== 0) {
            console.error(
              `GraphQL error while trying to move items from Box (id: ${boxLabelIdentifier}) into Distribution Event (id: ${distributionEventId})`,
              res.errors
            );
            toast({
              title: "Error",
              description: "Items couldn't be moved to the distribution event.",
              status: "error",
              duration: 2000,
              isClosable: true,
            });
          } else {
            toast({
              title: "Done!",
              description: `${numberOfItemsToMove} items moved to the distribution.`,
              status: "success",
              duration: 2000,
              isClosable: true,
            });
          }
        })
        .catch((err) => {
          console.error(err);
          toast({
            title: "Error",
            description: "Items couldn't be moved to the distribution event.",
            status: "error",
            duration: 2000,
            isClosable: true,
          });
        });
    },
    [
      distributionEventId,
      moveItemsToDistributionEventMutation,
      packingAddBoxOrItemsForPackingListEntryOverlayState,
      toast,
    ]
  );

  const onAddBoxToDistributionEvent = useCallback(
    (boxLabelIdentifier: string) => {
      packingAddBoxOrItemsForPackingListEntryOverlayState.onClose();
      moveBoxToDistributionEventMutation({
        variables: {
          boxLabelIdentifier,
          distributionEventId,
        },
      })
        .then((res) => {
          if (res.errors && res.errors.length !== 0) {
            console.error(
              `GraphQL error while trying to move Box (id: ${boxLabelIdentifier}) into Distribution Event (id: ${distributionEventId})`,
              res.errors
            );
            toast({
              title: "Error",
              description: "Box couldn't be moved to the distribution event.",
              status: "error",
              duration: 2000,
              isClosable: true,
            });
          } else {
            toast({
              title: "Done!",
              description: "Box moved to the distribution event.",
              status: "success",
              duration: 2000,
              isClosable: true,
            });
          }
        })
        .catch((err) => {
          console.error(err);
          toast({
            title: "Error",
            description: "Box couldn't be moved to the distribution event.",
            status: "error",
            duration: 2000,
            isClosable: true,
          });
        });
    },
    [
      distributionEventId,
      moveBoxToDistributionEventMutation,
      packingAddBoxOrItemsForPackingListEntryOverlayState,
      toast,
    ]
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
        <PackedContentListOverlayContainer
          packingListEntry={packingListEntry}
          onDeleteBoxFromDistribution={function (
            boxLabelIdentifier: string
          ): void {
            throw new Error("Function not implemented.");
          }}
        />
      </Modal>
      {/* <PackedListOverlay
        modalProps={{ isListOpen, onListClose }}
        boxesData={boxesData}
        // packingActionProps={packingActionListProps}
      /> */}
    </>
  );
};

const EnoughItemsPackedStateBadge = ({
  enoughItemsFacked,
}: {
  enoughItemsFacked: boolean;
}) => {
  if (enoughItemsFacked) {
    return (
      <Badge colorScheme="green">
        {/* <CheckIcon /> Target number ({packingListEntry.numberOfItems}) fullfilled (with {totalNumberOfPackedItems} items) */}
        <CheckIcon /> Enough items packed
      </Badge>
    );
  } else {
    return <Box>FOO</Box>;
  }
};

const DistroEventDetailsForPackingState = ({
  packingListEntries,
  distributionEventId,
}: // TODO: Group by product.id instead of name (because product name could be repeated)
DistroEventDetailsForPackingStateProps) => {
  const packingListEntriesGroupedByProductName = groupBy(
    packingListEntries,
    (item) => item.product.name
  );

  //TO DO Sort the sizes by size order
  const packingListEntriesGroupedByProductNameAsArray = Object.keys(
    packingListEntriesGroupedByProductName
  ).map((key) => {
    const packingListEntries = packingListEntriesGroupedByProductName[key].map(
      (el) => {
        const actualNumberOfItemsPacked =
          el.matchingPackedItemsCollections.reduce(
            (acc, cur) => acc + cur.numberOfItems,
            0
          );
        return {
          ...el,
          actualNumberOfItemsPacked,
          // ...el,
          // actualNumberOfItemsPacked: actualNumberOfItemsPacked,
        };
      }
    );
    // const isNumberOfItemsFulfilled = items..
    // items[0].numberOfItems
    // items[0].
    return {
      productName: key,
      packingListEntries,
    };
  });

  return <>
    <Center>
      <Accordion w={[300, 420, 500]} allowToggle>
        {packingListEntriesGroupedByProductNameAsArray.map(
          (packingEntriesArrayForProductName, i) => {
            const enoughItemsFacked =
              packingEntriesArrayForProductName.packingListEntries.every(
                (packingListEntry) =>
                  packingListEntry.actualNumberOfItemsPacked >=
                    packingListEntry.numberOfItems

              );
            return (
              <AccordionItem w={[300, 420, 500]} justifyItems="center" key={i}>
                <Flex justifyItems="center">
                  <AccordionButton zIndex="2">
                    <EnoughItemsPackedStateBadge
                      enoughItemsFacked={enoughItemsFacked}
                    />
                    <Box flex="1" textAlign="center">
                      <strong>
                        {packingEntriesArrayForProductName.productName}
                      </strong>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </Flex>
                {packingEntriesArrayForProductName.packingListEntries.map(
                  (item) => (
                    <PackingListEntry
                      packingListEntry={item}
                      key={item.id}
                      distributionEventId={distributionEventId}
                    />
                  )
                )}
              </AccordionItem>
            );
          },
          []
        )}
      </Accordion>
    </Center>
  </>;
};
export default DistroEventDetailsForPackingState;
