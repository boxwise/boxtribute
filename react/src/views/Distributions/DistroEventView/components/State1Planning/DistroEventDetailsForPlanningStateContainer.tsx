import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useCallback, useEffect, useState } from "react";
import {
  AddToPackingListMutation,
  AddToPackingListMutationVariables,
  AllProductsAndSizesQuery,
  AllProductsAndSizesQueryVariables,
  PackingListEntriesForDistributionEventQuery,
  PackingListEntriesForDistributionEventQueryVariables,
} from "types/generated/graphql";
import AddItemsToPackingList, {
  PackingListEntriesForProductToAdd,
} from "views/Distributions/components/AddItemsToPackingList/AddItemsToPackingList";
import AddItemsToPackingListContainer from "views/Distributions/components/AddItemsToPackingList/AddItemsToPackingListContainer";
import { DistributionEventDetails } from "views/Distributions/types";
import DistroEventDetailsForPlanningState, {
  PackingListEntry,
} from "./DistroEventDetailsForPlanningState";

interface DistroEventDetailsForPlanningStateContainerProps {
  // distroEventDetailsDataForPlanningState: DistroEventDetailsDataForPlanningState;
  // distributionEventId: string;
  distributionEventDetails: DistributionEventDetails;
}

export const PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY = gql`
  query PackingListEntriesForDistributionEvent($distributionEventId: ID!) {
    distributionEvent(id: $distributionEventId) {
      id
      packingList {
        entries {
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
      product {
        name
      }
    }
  }
`;

const graphqlToContainerTransformer = (
  queryResult: PackingListEntriesForDistributionEventQuery | undefined
): PackingListEntry[] => {
  // TODO: Do better (e.g. yup based) validation of the query result
  if (queryResult?.distributionEvent?.packingList == null) {
    throw new Error("packingList is null");
  }
  return queryResult?.distributionEvent?.packingList.entries.map((entry) => ({
    id: entry.id,
    // TODO: for productName, sizse and gender: remove the bangs again once we have proper (e.g. yup based) validation of query result
    productName: entry.product?.name!,
    size: entry.size!,
    gender: entry.product?.gender!,
    numberOfItems: entry.numberOfItems,
  }));
};

const DistroEventDetailsForPlanningStateContainer = ({
  // distroEventDetailsDataForPlanningState,
  distributionEventDetails,
}: DistroEventDetailsForPlanningStateContainerProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const
    { data, loading, error, refetch } = useQuery<
    PackingListEntriesForDistributionEventQuery,
    PackingListEntriesForDistributionEventQueryVariables
  >(PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY, {
    variables: { distributionEventId: distributionEventDetails.id },
  });

  // TODO: add proper error handling for the mutation
  // TODO: ensure to trigger the fetch of the packing list entries again when
  // the mutation is successful for ALL new entries (all sizeId/productId combinations)
  const [addEntryToPackingListMutation, addEntryToPackingListMutationStatus] =
    useMutation<AddToPackingListMutation, AddToPackingListMutationVariables>(
      ADD_ENTRY_TO_PACKING_LIST_MUTATION
    );

  const onAddEntiresToPackingListForProduct = useCallback(
    (entriesToAdd: PackingListEntriesForProductToAdd) => {
      // TODO: consider to offer a mutation in the API which allows to add multiple packing list entries
      // at once (instead of calling the mutation for each entry)
      Promise.all(
        entriesToAdd.sizeIdAndNumberOfItemTuples.map(
          ({ sizeId, numberOfItems }) => {
            addEntryToPackingListMutation({
              variables: {
                distributionEventId: distributionEventDetails.id,
                productId: entriesToAdd.productId,
                sizeId: parseInt(sizeId),
                numberOfItems,
              },
            });
            onClose();
          }
        )
      ).then(() => {
        refetch?.();
      });
    },
    [addEntryToPackingListMutation, distributionEventDetails.id, onClose, refetch]
  );

  if (loading) {
    return <APILoadingIndicator />;
  }

  if (error || (!loading && data == null)) {
    return <div>Error</div>;
  }

  const packingListEntries = graphqlToContainerTransformer(data);

  return (
    <>
      <DistroEventDetailsForPlanningState
        // distroEventDetailsData={distroEventDetailsDataForPlanningState}
        packingListEntries={packingListEntries}
        onAddItemsClick={onOpen}
        onCopyPackingListFromPreviousEventsClick={() => {}}
        onRemoveItemFromPackingListClick={() => {}}
        onEditItemOnPackingListClick={() => {}}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
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

          {/* <ModalFooter>
        <Button colorScheme='blue' mr={3} onClick={onClose}>
          Close
        </Button>
        <Button variant='ghost'>Secondary Action</Button>
      </ModalFooter> */}
        </ModalContent>
      </Modal>
    </>
  );
};

export default DistroEventDetailsForPlanningStateContainer;
