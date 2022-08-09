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
import { createContext, useCallback, useEffect } from "react";
import {
  AddToPackingListMutation,
  AddToPackingListMutationVariables,
  PackingListEntriesForDistributionEventQuery,
  PackingListEntriesForDistributionEventQueryVariables,
  RemoveEntryFromPackingListMutation,
  RemoveEntryFromPackingListMutationVariables,
  UpdatePackingListEntryMutation,
  UpdatePackingListEntryMutationVariables,
} from "types/generated/graphql";
import { PackingListEntriesForProductToAdd } from "views/Distributions/components/AddItemsToPackingList/AddItemsToPackingList";
import AddItemsToPackingListContainer from "views/Distributions/components/AddItemsToPackingList/AddItemsToPackingListContainer";
import { graphqlPackingListEntriesForDistributionEventTransformer } from "views/Distributions/dataTransformers";
import { PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY } from "views/Distributions/queries";
import {
  DistributionEventDetails,
  IPackingListEntry,
} from "views/Distributions/types";
import DistroEventDetailsForPlanningState from "./DistroEventDetailsForPlanningState";

interface IDistroEventDetailsForPlanningStateContext {
  distributionEvent: DistributionEventDetails;
  onRemoveAllPackingListEntriesForProduct: (productId: string) => void;
}

export const DistroEventDetailsForPlanningStateContext = createContext<IDistroEventDetailsForPlanningStateContext | null>(null);


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


export const UPDATE_PACKING_LIST_ENTRY_MUTATION = gql`
  mutation updatePackingListEntry(
    $packingListEntryId: ID!
    $numberOfItems: Int!
  ) {
    updatePackingListEntry(
        packingListEntryId: $packingListEntryId
        numberOfItems: $numberOfItems
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

  const [updatePackingListEntryMutation] = useMutation<UpdatePackingListEntryMutation, UpdatePackingListEntryMutationVariables>(UPDATE_PACKING_LIST_ENTRY_MUTATION, {
  refetchQueries: [
    {
      query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
      variables: {
        distributionEventId: distributionEventDetails.id,
      },
    },
  ],
});

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
      ).then((results) => {
        if (results.some((r) => r.errors && r.errors.length !== 0)) {
          console.error(
            `GraphQL error while trying to add Packing List Entries to Distribution Event (id: ${distributionEventDetails.id})`
            // TODO: consider to track the respective error details
            // res.errors
          );
          toast({
            title: "Error",
            description:
              "Some or all of the packing list items couldn't be added/updated.",
            status: "error",
            duration: 2000,
            isClosable: true,
          });
        } else {
          toast({
            title: `Successfully added ${numberOfAddedEntries} entries`,
            status: "success",
            isClosable: true,
            duration: 2000,
          });
        }
        addItemsToDistroEventsOverlayState.onClose();
      });
      // TODO: add here also error catching and user notification
    },
    [
      addEntryToPackingListMutation,
      addItemsToDistroEventsOverlayState,
      distributionEventDetails.id,
      toast,
    ]
  );

  const onUpdatePackingListEntry = (
    packingListEntryId: string,
    numberOfItems: number
  ) => {
    // alert("onUpdatePackingListEntry");
    updatePackingListEntryMutation({
      variables: {
        packingListEntryId: packingListEntryId,
        numberOfItems,
      },
    }).then((result) => {
      if (result.errors && result.errors.length !== 0) {
        console.error(
          `GraphQL error while trying to update Packing List Entry (id: ${packingListEntryId})`
          // TODO: consider to track the respective error details
          // res.errors
        );
        toast({
          title: "Error",
          description:
            "Some of the packing list entries couldn't be updated.",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      } else {
        toast({
          title: `Successfully updated packing list entry`,
          status: "success",
          isClosable: true,
          duration: 2000,
        });
        }
    });
  };

  const onRemoveItemFromPackingList = useCallback(
    (packlistEntryId: string) => {
      removeEntryFromPackingListMutation({
        variables: {
          packingListEntryId: packlistEntryId,
        },
      }).then((res) => {
        if (res.errors && res.errors.length !== 0) {
          console.error(
            `GraphQL error while trying to remove packing list entry from Distribution Event (id: ${distributionEventDetails.id})`,
            res.errors
          );
          toast({
            title: "Error",
            description:
              "Packing list entry couldn't be removed from the distribution event.",
            status: "error",
            duration: 2000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Successfully removed entry",
            status: "success",
            isClosable: true,
            duration: 2000,
          });
        }
      });
    },
    [distributionEventDetails.id, removeEntryFromPackingListMutation, toast]
  );

  const onRemoveAllPackingListEntriesForProduct = (productId: string) => {
    alert("on remove all packing list entries for product");
  }

  if (loading) {
    return <APILoadingIndicator />;
  }

  if (error || (!loading && data == null)) {
    return <div>Error</div>;
  }

  const packingListEntries: IPackingListEntry[] | undefined =
    graphqlPackingListEntriesForDistributionEventTransformer(data);

  if (packingListEntries == null) {
    return <div>Error: No data found</div>;
  }



  const contextValues: IDistroEventDetailsForPlanningStateContext = {
    distributionEvent: distributionEventDetails,
    onRemoveAllPackingListEntriesForProduct
  }

  return (
    <DistroEventDetailsForPlanningStateContext.Provider value={contextValues}>
      <DistroEventDetailsForPlanningState
        packingListEntries={packingListEntries}
        onAddItemsClick={addItemsToDistroEventsOverlayState.onOpen}
        onCopyPackingListFromPreviousEventsClick={() => {}}
        onRemoveItemFromPackingListClick={onRemoveItemFromPackingList}
        onUpdatePackingListEntry={
          onUpdatePackingListEntry
        }
      />

      {/* TODO: Consider to extract this into a seperate component */}
      <Modal
        isOpen={addItemsToDistroEventsOverlayState.isOpen}
        onClose={addItemsToDistroEventsOverlayState.onClose}
      >
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
              currentPackingListEntries={packingListEntries}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      </DistroEventDetailsForPlanningStateContext.Provider>
  );
};

export default DistroEventDetailsForPlanningStateContainer;
