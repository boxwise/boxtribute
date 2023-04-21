import { gql, useMutation, useQuery } from "@apollo/client";
import { useToast } from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { createContext, useCallback } from "react";
import {
  PackingListEntriesForDistributionEventQuery,
  PackingListEntriesForDistributionEventQueryVariables,
  RemoveItemsFromUnboxedItemsCollectionMutation,
  RemoveItemsFromUnboxedItemsCollectionMutationVariables,
  UnassignBoxFromDistributionEventMutation,
  UnassignBoxFromDistributionEventMutationVariables,
} from "types/generated/graphql";
import { BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY } from "views/Box/BoxView";
import { graphqlPackingListEntriesForDistributionEventTransformer } from "views/Distributions/dataTransformers";
import {
  DISTRIBUTION_EVENT_QUERY,
  PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
  UNASSIGN_BOX_FROM_DISTRIBUTION_MUTATION,
} from "views/Distributions/queries";
import { DistributionEventDetails } from "views/Distributions/types";
import DistroEventDetailsForPackingState from "./DistroEventDetailsForPackingState";

const REMOVE_ITEMS_FROM_UNBOXED_ITEMS_COLLECTION_MUTATION = gql`
  mutation RemoveItemsFromUnboxedItemsCollection($id: ID!, $numberOfItems: Int!) {
    removeItemsFromUnboxedItemsCollection(id: $id, numberOfItems: $numberOfItems) {
      id
      numberOfItems
      product {
        name
      }
    }
  }
`;

interface IDistroEventDetailsForPackingStateContext {
  onUnassignBoxFromDistributionEvent: (labelIdentifier: string) => void;
  onRemoveUnboxedItems: (unboxedItemsCollectionId: string, numberOfItems: number) => void;
}

export const DistroEventDetailsForPackingStateContext =
  createContext<IDistroEventDetailsForPackingStateContext | null>(null);

interface DistroEventDetailsForPackingStateProps {
  distributionEventDetails: DistributionEventDetails;
}

const DistroEventDetailsForPackingStateContainer = ({
  distributionEventDetails,
}: DistroEventDetailsForPackingStateProps) => {
  const toast = useToast();

  const [removeItemsFromUnboxedItemsCollectionMutation] = useMutation<
    RemoveItemsFromUnboxedItemsCollectionMutation,
    RemoveItemsFromUnboxedItemsCollectionMutationVariables
  >(REMOVE_ITEMS_FROM_UNBOXED_ITEMS_COLLECTION_MUTATION);

  const [unassignBoxFromDistributionEventMutation] = useMutation<
    UnassignBoxFromDistributionEventMutation,
    UnassignBoxFromDistributionEventMutationVariables
  >(UNASSIGN_BOX_FROM_DISTRIBUTION_MUTATION);

  const distributionEventId = distributionEventDetails.id;

  const onRemoveUnboxedItems = (unboxedItemsCollectionId: string, numberOfItems: number) => {
    const handleError = (errors: any) => {
      console.error(
        `Error while trying to remove items (${numberOfItems}) from unboxed items collection (unbox items collection id: ${unboxedItemsCollectionId}) from distribution event ${distributionEventId}`,
        errors,
      );
      toast({
        title: "Error",
        description: "Couldn't remove items from distribution event. Please try again.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    };

    removeItemsFromUnboxedItemsCollectionMutation({
      variables: {
        id: unboxedItemsCollectionId,
        numberOfItems,
      },
      refetchQueries: [
        {
          query: DISTRIBUTION_EVENT_QUERY,
          variables: {
            eventId: distributionEventId,
          },
        },
        {
          query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
          variables: {
            distributionEventId,
          },
        },
      ],
    })
      .then((res) => {
        if (res.errors && res.errors.length !== 0) {
          handleError(res.errors);
        } else {
          toast({
            title: "Successfully removed items from distribution event. ",
            status: "success",
            isClosable: true,
            duration: 2000,
          });
        }
      })
      .catch((error) => {
        handleError(error);
      });
  };

  const onUnassignBoxFromDistributionEvent = useCallback(
    (boxLabelIdentifier: string) => {
      const handleError = (errors: any) => {
        console.error(
          `Error while trying to unassign box (label identifier: ${boxLabelIdentifier}) from distribution event ${distributionEventId}`,
          errors,
        );
        toast({
          title: "Error",
          description: "Box couldn't be unassigned from from the distribution event.",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      };

      unassignBoxFromDistributionEventMutation({
        variables: {
          boxLabelIdentifier,
          distributionEventId,
        },
        refetchQueries: [
          {
            query: DISTRIBUTION_EVENT_QUERY,
            variables: {
              eventId: distributionEventId,
            },
          },
          {
            query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
            variables: {
              distributionEventId,
            },
          },
          {
            query: BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY,
            variables: {
              labelIdentifier: boxLabelIdentifier,
            },
          },
        ],
        update: (cache, { data }) => {
          cache.modify({
            fields: {
              packingListEntriesForDistributionEvent(existingPackingListEntries) {},
            },
          });
        },
      })
        .then((res) => {
          if (res.errors && res.errors.length !== 0) {
            handleError(res.errors);
          } else {
            toast({
              title: "Successfully unassigned box from distribution event. ",
              status: "success",
              isClosable: true,
              duration: 2000,
            });
          }
        })
        .catch((error) => {
          handleError(error);
        });
    },
    [distributionEventId, toast, unassignBoxFromDistributionEventMutation],
  );

  const contextValues: IDistroEventDetailsForPackingStateContext = {
    onUnassignBoxFromDistributionEvent,
    onRemoveUnboxedItems,
  };

  const { data, loading, error } = useQuery<
    PackingListEntriesForDistributionEventQuery,
    PackingListEntriesForDistributionEventQueryVariables
  >(PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY, {
    variables: { distributionEventId: distributionEventDetails.id },
    // pollInterval: 5000,
  });

  if (loading) {
    return <APILoadingIndicator />;
  }

  if (error || (!loading && data == null)) {
    return <div>Error</div>;
  }

  // const packingListEntries = useMemo(() => graphqlPackingListEntriesForDistributionEventTransformer(data), [data]);
  const packingListEntries = graphqlPackingListEntriesForDistributionEventTransformer(data);

  if (packingListEntries == null) {
    return <div>Error: No data found</div>;
  }

  return (
    <DistroEventDetailsForPackingStateContext.Provider value={contextValues}>
      <DistroEventDetailsForPackingState
        packingListEntries={packingListEntries}
        distributionEventId={distributionEventDetails.id}
      />
    </DistroEventDetailsForPackingStateContext.Provider>
  );
};

export default DistroEventDetailsForPackingStateContainer;
