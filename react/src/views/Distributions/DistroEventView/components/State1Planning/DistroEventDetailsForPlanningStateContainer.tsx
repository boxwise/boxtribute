import { gql, useQuery } from "@apollo/client";
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
import { useCallback } from "react";
import {
  AllProductsAndSizesQuery,
  AllProductsAndSizesQueryVariables,
  PackingListEntriesForDistributionEventQuery,
  PackingListEntriesForDistributionEventQueryVariables,
} from "types/generated/graphql";
import AddItemsToPackingList, {
  PackingListEntriesForProductToAdd,
} from "views/Distributions/AddItemToPackingListView/components/AddItemsToPackingList";
import AddItemsToPackingListContainer from "views/Distributions/AddItemToPackingListView/components/AddItemsToPackingListContainer";
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

// type FOO = PackingListEntriesForDistributionEventQuery["distributionEvent"]//;["packingList"];//["entries"];

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
  // return [];
};

const DistroEventDetailsForPlanningStateContainer = ({
  // distroEventDetailsDataForPlanningState,
  distributionEventDetails,
}: DistroEventDetailsForPlanningStateContainerProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, loading, error } = useQuery<
    PackingListEntriesForDistributionEventQuery,
    PackingListEntriesForDistributionEventQueryVariables
  >(PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY, {variables: {distributionEventId: distributionEventDetails.id}});


  const onAddEntiresToPackingListForProduct = useCallback(
    (entriesToAdd: PackingListEntriesForProductToAdd) => {},
    []
  );

  if(loading) {
    return <APILoadingIndicator />;
  }

  if(error) {
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
