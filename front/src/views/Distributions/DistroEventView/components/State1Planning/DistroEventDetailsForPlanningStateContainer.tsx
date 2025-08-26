import { useMutation,useQuery } from '@apollo/client/react';
import { graphql } from "../../../../../../../graphql/graphql";
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
import { createContext, useCallback } from "react";
import AddItemsToPackingListContainer from "views/Distributions/components/AddItemsToPackingList/AddItemsToPackingListContainer";
import { graphqlPackingListEntriesForDistributionEventTransformer } from "views/Distributions/dataTransformers";
import { PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY } from "views/Distributions/queries";
import { DistributionEventDetails, IPackingListEntry } from "views/Distributions/types";
import DistroEventDetailsForPlanningState from "./DistroEventDetailsForPlanningState";

interface IDistroEventDetailsForPlanningStateContext {
  distributionEvent: DistributionEventDetails;
  onRemoveAllPackingListEntriesForProduct: (productId: string) => void;
  onUpdateProductsInPackingList: (productIdsToAdd: string[], productIdsToRemove: string[]) => void;
}

export const DistroEventDetailsForPlanningStateContext =
  createContext<IDistroEventDetailsForPlanningStateContext | null>(null);

interface DistroEventDetailsForPlanningStateContainerProps {
  distributionEventDetails: DistributionEventDetails;
}

export const REMOVE_ENTRY_FROM_PACKING_LIST = graphql(`
  mutation RemoveEntryFromPackingList($packingListEntryId: ID!) {
    removePackingListEntryFromDistributionEvent(packingListEntryId: $packingListEntryId) {
      id
    }
  }
`);

export const REMOVE_ALL_PACKING_LIST_ENTRIES_FROM_DISTRIBUTION_EVENT_FOR_PRODUCT = graphql(`
  mutation RemoveAllPackingListEntriesFromDistributionEventForProduct(
    $distributionEventId: ID!
    $productId: ID!
  ) {
    removeAllPackingListEntriesFromDistributionEventForProduct(
      distributionEventId: $distributionEventId
      productId: $productId
    )
  }
`);

export const UPDATE_SELECTED_PRODUCTS_FOR_DISTRO_EVENT_PACKING_LIST_MUTATION = graphql(`
  mutation UpdateSelectedProductsForDistributionEventPackingList(
    $distributionEventId: ID!
    $productIdsToAdd: [ID!]!
    $productIdsToRemove: [ID!]!
  ) {
    updateSelectedProductsForDistributionEventPackingList(
      distributionEventId: $distributionEventId
      productIdsToAdd: $productIdsToAdd
      productIdsToRemove: $productIdsToRemove
    ) {
      id
    }
  }
`);

export const UPDATE_PACKING_LIST_ENTRY_MUTATION = graphql(`
  mutation updatePackingListEntry($packingListEntryId: ID!, $numberOfItems: Int!) {
    updatePackingListEntry(packingListEntryId: $packingListEntryId, numberOfItems: $numberOfItems) {
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
`);

export const ADD_ENTRY_TO_PACKING_LIST_MUTATION = graphql(`
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
`);

const DistroEventDetailsForPlanningStateContainer = ({
  distributionEventDetails,
}: DistroEventDetailsForPlanningStateContainerProps) => {
  const addItemsToDistroEventsOverlayState = useDisclosure();

  const { data, loading, error } = useQuery(PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY, {
    variables: { distributionEventId: distributionEventDetails.id },
  });

  const toast = useToast();

  const [updatePackingListEntryMutation] = useMutation(UPDATE_PACKING_LIST_ENTRY_MUTATION, {
    refetchQueries: [
      {
        query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
        variables: {
          distributionEventId: distributionEventDetails.id,
        },
      },
    ],
  });

  const [removeEntryFromPackingListMutation] = useMutation(REMOVE_ENTRY_FROM_PACKING_LIST, {
    refetchQueries: [
      {
        query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
        variables: {
          distributionEventId: distributionEventDetails.id,
        },
      },
    ],
  });

  const [removeAllPackingListEntriesFromDistributionEventForProductMutation] = useMutation(
    REMOVE_ALL_PACKING_LIST_ENTRIES_FROM_DISTRIBUTION_EVENT_FOR_PRODUCT,
    {
      refetchQueries: [
        {
          query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
          variables: {
            distributionEventId: distributionEventDetails.id,
          },
        },
      ],
    },
  );

  const onUpdatePackingListEntry = (packingListEntryId: string, numberOfItems: number) => {
    updatePackingListEntryMutation({
      variables: {
        packingListEntryId: packingListEntryId,
        numberOfItems,
      },
    }).then((result) => {
      if (result.error && result.error?.graphQLErrors?.length !== 0) {
        console.error(
          `GraphQL error while trying to update Packing List Entry (id: ${packingListEntryId})`,
          // TODO: consider to track the respective error details
        );
        toast({
          title: "Error",
          description: "Some of the packing list entries couldn't be updated.",
          status: "error",
          duration: 2000,
          isClosable: true,
          position: "top-right",
        });
      } else {
        toast({
          title: `Successfully updated packing list entry`,
          status: "success",
          isClosable: true,
          duration: 2000,
          position: "top-right",
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
      })
        .then((res) => {
          if (res.error && res.error?.graphQLErrors?.length !== 0) {
            console.error(
              `GraphQL error while trying to remove packing list entry from Distribution Event (id: ${distributionEventDetails.id})`,
              res.error,
            );
            toast({
              title: "Error",
              description: "Packing list entry couldn't be removed from the distribution event.",
              status: "error",
              duration: 2000,
              isClosable: true,
              position: "top-right",
            });
          } else {
            toast({
              title: "Successfully removed entry",
              status: "success",
              isClosable: true,
              duration: 2000,
              position: "top-right",
            });
          }
        })
        .catch((error) => {
          console.error(
            `Error while trying to remove packing list entry from Distribution Event (id: ${distributionEventDetails.id})`,
            error,
          );
          toast({
            title: "Error",
            description: "Packing list entry couldn't be removed from the distribution event.",
            status: "error",
            duration: 2000,
            isClosable: true,
            position: "top-right",
          });
        });
    },
    [distributionEventDetails.id, removeEntryFromPackingListMutation, toast],
  );

  const distributionEventId = distributionEventDetails.id;

  const onRemoveAllPackingListEntriesForProduct = useCallback(
    (productId: string) => {
      removeAllPackingListEntriesFromDistributionEventForProductMutation({
        variables: {
          distributionEventId,
          productId,
        },
      })
        .then((res) => {
          if (res.error && res.error?.graphQLErrors?.length !== 0) {
            console.error(
              `Error while trying to remove all packing list entries from Distribution Event (id: ${distributionEventId}) for product id ${productId}`,
              res.error,
            );
            toast({
              title: "Error",
              description: "Packing list entries couldn't be removed from the distribution event.",
              status: "error",
              duration: 2000,
              isClosable: true,
              position: "top-right",
            });
          } else {
            toast({
              title: "Successfully removed entries. ",
              status: "success",
              isClosable: true,
              duration: 2000,
              position: "top-right",
            });
          }
        })
        .catch((error) => {
          console.error(
            `Error while trying to remove all packing list entries from Distribution Event (id: ${distributionEventId}) for product id ${productId}`,
            error,
          );
          toast({
            title: "Error",
            description: "Packing list entries couldn't be removed from the distribution event.",
            status: "error",
            duration: 2000,
            isClosable: true,
            position: "top-right",
          });
        });
    },
    [
      distributionEventId,
      removeAllPackingListEntriesFromDistributionEventForProductMutation,
      toast,
    ],
  );

  const [updateProductsInPackingListMutation] = useMutation(
    UPDATE_SELECTED_PRODUCTS_FOR_DISTRO_EVENT_PACKING_LIST_MUTATION,
    {
      refetchQueries: [
        {
          query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
          variables: {
            distributionEventId: distributionEventDetails.id,
          },
        },
      ],
    },
  );

  const distroEventId = distributionEventDetails.id;

  const onUpdateProductsInPackingList = useCallback(
    (productIdsToAdd: string[], productIdsToRemove: string[]) => {
      updateProductsInPackingListMutation({
        variables: {
          distributionEventId: distroEventId,
          productIdsToAdd,
          productIdsToRemove,
        },
      })
        .then((res) => {
          if (res.error && res.error?.graphQLErrors?.length !== 0) {
            console.error(
              `GraphQL error while trying to update selected products for packing list of Distribution Event (id: ${distroEventId})`,
              res.error,
            );
            toast({
              title: "Error",
              description: "Packing list entry couldn't be updated.",
              status: "error",
              duration: 2000,
              isClosable: true,
              position: "top-right",
            });
          } else {
            toast({
              title: "Successfully updated the Products for the Packing List.",
              status: "success",
              isClosable: true,
              duration: 2000,
              position: "top-right",
            });
          }
        })
        .catch((error) => {
          console.error(
            `GraphQL error while trying to update selected products for packing list of Distribution Event (id: ${distroEventId})`,
            error,
          );
          toast({
            title: "Error",
            description: "Packing list entry couldn't be updated.",
            status: "error",
            duration: 2000,
            isClosable: true,
            position: "top-right",
          });
        });
    },
    [distroEventId, toast, updateProductsInPackingListMutation],
  );

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
    onRemoveAllPackingListEntriesForProduct,
    onUpdateProductsInPackingList,
  };

  return (
    <DistroEventDetailsForPlanningStateContext.Provider value={contextValues}>
      <DistroEventDetailsForPlanningState
        packingListEntries={packingListEntries}
        onAddItemsClick={addItemsToDistroEventsOverlayState.onOpen}
        onCopyPackingListFromPreviousEventsClick={() => {}}
        onRemoveItemFromPackingListClick={onRemoveItemFromPackingList}
        onUpdatePackingListEntry={onUpdatePackingListEntry}
      />

      {/* TODO: Consider to extract this into a seperate component */}
      <Modal
        isOpen={addItemsToDistroEventsOverlayState.isOpen}
        onClose={addItemsToDistroEventsOverlayState.onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{distributionEventDetails.distributionSpot.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AddItemsToPackingListContainer
              onClose={addItemsToDistroEventsOverlayState.onClose}
              currentPackingListEntries={packingListEntries}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </DistroEventDetailsForPlanningStateContext.Provider>
  );
};

export default DistroEventDetailsForPlanningStateContainer;
