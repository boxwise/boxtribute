import { useMutation } from "@apollo/client";
import { AddIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Modal,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import _ from "lodash";
import { useCallback } from "react";
import {
  AssignBoxToDistributionEventMutation,
  AssignBoxToDistributionEventMutationVariables,
  MoveItemsToDistributionEventMutation,
  MoveItemsToDistributionEventMutationVariables,
} from "types/generated/graphql";
import { groupBy } from "utils/helpers";
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
    isOpen: isPackedListOverlayOpen,
    onClose: onPackedListOverlayClose,
    onOpen: onListOpen,
  } = useDisclosure();
  const packingAddBoxOrItemsForPackingListEntryOverlayState = useDisclosure();

  const toast = useToast();

  const [assignBoxToDistributionEventMutation] = useMutation<
    AssignBoxToDistributionEventMutation,
    AssignBoxToDistributionEventMutationVariables
  >(ASSIGN_BOX_TO_DISTRIBUTION_MUTATION);

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
              distributionEventId: distributionEventId,
            },
          },
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
      assignBoxToDistributionEventMutation,
      packingAddBoxOrItemsForPackingListEntryOverlayState,
      toast,
    ]
  );

  return (
    <Flex
      alignItems="center"
      borderTop="1px"
      borderColor="gray.300"
      direction="row"
      pl={6}
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
    </Flex>
  );
};

const DistroEventDetailsForPackingState = ({
  packingListEntries,
  distributionEventId,
}: // TODO: Group by product.id instead of name (because product name could be repeated)
DistroEventDetailsForPackingStateProps) => {
  const packingListEntriesWithTargetNumberOfItemsBiggerThanZero =
    packingListEntries.filter((el) => el.numberOfItems > 0);
  const packingListEntriesGroupedByProductName = groupBy(
    packingListEntriesWithTargetNumberOfItemsBiggerThanZero,
    (item) => item.product.id
  );

  //TO DO Sort the sizes by size order
  const packingListEntriesGroupedByProductNameAsArray = _(
    packingListEntriesGroupedByProductName
  )
    .keys()
    .map((key) => {
      const packingListEntries = packingListEntriesGroupedByProductName[
        key
      ].map((el) => {
        const actualNumberOfItemsPacked =
          el.matchingPackedItemsCollections.reduce(
            (acc, cur) => acc + cur.numberOfItems,
            0
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
          (el) => el.actualNumberOfItemsPacked >= el.numberOfItems
        ),
        packingListEntries: _(packingListEntries)
          .sortBy((el) =>
            el.actualNumberOfItemsPacked >= el.numberOfItems ? 1 : -1
          )
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
      <Button onClick={onClickScanBoxesForDistroEvent}>
        Scan Boxes for this Distro Event
      </Button>
      <VStack spacing={0}>
        <Heading size="md">Packing List</Heading>
        <Accordion allowToggle px={3} py={3}>
          {packingListEntriesGroupedByProductNameAsArray.map(
            (packingEntriesArrayForProductName, i) => {
              return (
                <AccordionItem
                  w={[300, 420, 500]}
                  justifyItems="center"
                  key={packingEntriesArrayForProductName.product.id}
                  bg={
                    packingEntriesArrayForProductName.allPackingListEntriesFulfilled
                      ? "green.100"
                      : "red.100"
                  }
                >
                  <Flex justifyItems="center">
                    <AccordionButton zIndex="2">
                      {/* <EnoughItemsPackedStateBadge
                        enoughItemsFacked={enoughItemsFacked}
                      /> */}
                      <Box flex="1" textAlign="center">
                        <Text fontSize={"lg"} fontWeight="bold">
                          {packingEntriesArrayForProductName.product.name} (
                          {packingEntriesArrayForProductName.product.gender})
                        </Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </Flex>
                  {packingEntriesArrayForProductName.packingListEntries.map(
                    (item) => (
                      <AccordionPanel
                        py={0}
                        bg={
                          item.actualNumberOfItemsPacked >= item.numberOfItems
                            ? "green.100"
                            : "red.100"
                        }
                      >
                        <PackingListEntry
                          packingListEntry={item}
                          key={item.id}
                          distributionEventId={distributionEventId}
                        />
                      </AccordionPanel>
                    )
                  )}
                </AccordionItem>
              );
            },
            []
          )}
        </Accordion>
        {/* <Button my={2} onClick={() => {}} colorScheme="blue">
          You're all set - move to Distribution Stage.
        </Button> */}
      </VStack>
      <VStack spacing={1}>
        <Button onClick={onAddAdditionalItemsButtonClick} size={"sm"}>
          Add additional items to this Distro Event
        </Button>
        <Text fontSize="xs">
          * You can add additional items to this event, even if they are not
          listed on the Packing list.
        </Text>
      </VStack>
    </>
  );
};
export default DistroEventDetailsForPackingState;
