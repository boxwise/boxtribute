import { gql, useMutation, useQuery } from "@apollo/client";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useCallback } from "react";
import {
  AddToPackingListMutation,
  AddToPackingListMutationVariables,
  PackingListEntriesForDistributionEventQuery,
  PackingListEntriesForDistributionEventQueryVariables,
  RemoveEntryFromPackingListMutation,
  RemoveEntryFromPackingListMutationVariables,
} from "types/generated/graphql";
import { PackingListEntriesForProductToAdd } from "views/Distributions/components/AddItemsToPackingList/AddItemsToPackingList";
import AddItemsToPackingListContainer from "views/Distributions/components/AddItemsToPackingList/AddItemsToPackingListContainer";
import { graphqlPackingListEntriesForDistributionEventTransformer } from "views/Distributions/dataTransformers";
import { PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY } from "views/Distributions/queries";
import { DistributionEventDetails, IPackingListEntry } from "views/Distributions/types";
import DistroEventDetailsForPlanningState from "./DistroEventDetailsForPlanningState";

interface DistroEventDetailsForPlanningStateContainerProps {
  distributionEventDetails: DistributionEventDetails;
}

export const REMOVE_ENTRY_FROM_PACKING_LIST = gql`
  mutation RemoveEntryFromPackingList($packingListEntryId: ID!) {
    removePackingListEntryFromDistributionEvent(
      packingListEntryId: $packingListEntryId
    ) {
      id
    }
  }
`;

export const ADD_ENTRY_TO_PACKING_LIST_MUTATION = gql`
  mutation addToPackingList(
    $distributionEventId: ID!
    $productId: Int!
    $sizeId: Int!
    $numberOfItems: Int!
  ) {
    addPackingListEntryToDistributionEvent(
      creationInput: {
        distributionEventId: $distributionEventId
        productId: $productId
        sizeId: $sizeId
        numberOfItems: $numberOfItems
      }
    ) {
      id
      numberOfItems
      product {
        id
        name
        gender
      }
      size {
        id
        label
      }
    }
  }
`;

const DistroEventDetailsForPlanningStateContainer = ({
  distributionEventDetails,
}: DistroEventDetailsForPlanningStateContainerProps) => {
  const addItemsToDistroEventsOverlayState = useDisclosure();

  const { data, loading, error } = useQuery<
    PackingListEntriesForDistributionEventQuery,
    PackingListEntriesForDistributionEventQueryVariables
  >(PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY, {
    variables: { distributionEventId: distributionEventDetails.id },
  });

  const toast = useToast();

  // TODO: add proper error handling for the mutation
  // TODO: ensure to trigger the fetch of the packing list entries again when
  // the mutation is successful for ALL new entries (all sizeId/productId combinations)
  const [addEntryToPackingListMutation] = useMutation<
    AddToPackingListMutation,
    AddToPackingListMutationVariables
  >(ADD_ENTRY_TO_PACKING_LIST_MUTATION, {
    refetchQueries: [
      {
        query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
        variables: {
          distributionEventId: distributionEventDetails.id,
        },
      },
    ],

    // update(cache, { data }) {
    //   const newPackingListEntry =
    //     data?.addPackingListEntryToDistributionEvent;
    //   const existingPackingListEntries =
    //     cache.readQuery<PackingListEntriesForDistributionEventQuery>({
    //       query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
    //       variables: {
    //         distributionEventId: distributionEventDetails.id,
    //       },
    //     });

    //   console.log("existingPackingListEntries", existingPackingListEntries);
    //   console.log("newPackingListEntry", newPackingListEntry);
    //   if (existingPackingListEntries && newPackingListEntry) {
    //     console.log(
    //       "in 'if (existingPackingListEntries && newPackingListEntry)'"
    //     );
    //     cache.writeQuery<PackingListEntriesForDistributionEventQuery>({
    //       query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
    //       variables: {
    //         distributionEventId: distributionEventDetails.id,
    //       },
    //       data: {
    //         distributionEvent: {
    //           // TODO: reconsider using the bang here (e.g. zod based)
    //           id: existingPackingListEntries?.distributionEvent?.id!,
    //           packingList: {
    //             entries: [
    //               ...existingPackingListEntries?.distributionEvent
    //                 ?.packingList?.entries!,
    //               newPackingListEntry,
    //             ],
    //           },
    //         },
    //       },
    //     });
    //   }
    // },
  });

  const [removeEntryFromPackingListMutation] = useMutation<
    RemoveEntryFromPackingListMutation,
    RemoveEntryFromPackingListMutationVariables
  >(REMOVE_ENTRY_FROM_PACKING_LIST, {
    refetchQueries: [
      {
        query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
        variables: {
          distributionEventId: distributionEventDetails.id,
        },
      },
    ],
  });

  const onAddEntiresToPackingListForProduct = useCallback(
    (entriesToAdd: PackingListEntriesForProductToAdd) => {
      // TODO: consider to offer a mutation in the API which allows to add multiple packing list entries
      // at once (instead of calling the mutation for each entry)
      const numberOfAddedEntries =
        entriesToAdd.sizeIdAndNumberOfItemTuples.length;
      Promise.all(
        entriesToAdd.sizeIdAndNumberOfItemTuples.map(
          ({ sizeId, numberOfItems }) => {
            return addEntryToPackingListMutation({
              variables: {
                distributionEventId: distributionEventDetails.id,
                productId: entriesToAdd.productId,
                sizeId: parseInt(sizeId),
                numberOfItems,
              },
            });
          }
        )
      ).then(() => {
        toast({
          title: `Successfully added ${numberOfAddedEntries} entries`,
          status: "success",
          isClosable: true,
          duration: 2000,
        });
        addItemsToDistroEventsOverlayState.onClose();
      });
      // TODO: add here also error catching and user notification
    },
    [addEntryToPackingListMutation, addItemsToDistroEventsOverlayState, distributionEventDetails.id, toast]
  );

  const onRemoveItemFromPackingList = useCallback(
    (packlistEntryId: string) => {
      removeEntryFromPackingListMutation({
        variables: {
          packingListEntryId: packlistEntryId,
        },
      }).then(() =>
        toast({
          title: "Successfully removed entry",
          status: "success",
          isClosable: true,
          duration: 2000,
        })
      );
    },
    [removeEntryFromPackingListMutation, toast]
  );

  if (loading) {
    return <APILoadingIndicator />;
  }

  if (error || (!loading && data == null)) {
    return <div>Error</div>;
  }

  const packingListEntries = graphqlPackingListEntriesForDistributionEventTransformer(data);

  if(packingListEntries == null) {
    return <div>Error: No data found</div>;
  }

  return (
    <>
      <DistroEventDetailsForPlanningState
        packingListEntries={packingListEntries}
        onAddItemsClick={addItemsToDistroEventsOverlayState.onOpen}
        onCopyPackingListFromPreviousEventsClick={() => {}}
        onRemoveItemFromPackingListClick={onRemoveItemFromPackingList}
        onEditItemOnPackingListClick={() => {}}
      />

      {/* TODO: Consider to extract this into a seperate component */}
      <Modal isOpen={addItemsToDistroEventsOverlayState.isOpen} onClose={addItemsToDistroEventsOverlayState.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {distributionEventDetails.distributionSpot.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AddItemsToPackingListContainer
              onAddEntiresToPackingListForProduct={
                onAddEntiresToPackingListForProduct
              }
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DistroEventDetailsForPlanningStateContainer;
