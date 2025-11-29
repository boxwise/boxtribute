import { useMutation, useQuery } from "@apollo/client";
import { graphql } from "../../../../../../../graphql/graphql";
import { toaster } from "@boxtribute/shared-components/chakra-v3/Toaster";
import APILoadingIndicator from "components/APILoadingIndicator";
import { BOX_BY_LABEL_IDENTIFIER_AND_ALL_SHIPMENTS_QUERY } from "queries/queries";
import { createContext, useCallback } from "react";
import { graphqlPackingListEntriesForDistributionEventTransformer } from "views/Distributions/dataTransformers";
import {
  DISTRIBUTION_EVENT_QUERY,
  PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
  UNASSIGN_BOX_FROM_DISTRIBUTION_MUTATION,
} from "views/Distributions/queries";
import { DistributionEventDetails } from "views/Distributions/types";
import DistroEventDetailsForPackingState from "./DistroEventDetailsForPackingState";

const REMOVE_ITEMS_FROM_UNBOXED_ITEMS_COLLECTION_MUTATION = graphql(`
  mutation RemoveItemsFromUnboxedItemsCollection($id: ID!, $numberOfItems: Int!) {
    removeItemsFromUnboxedItemsCollection(id: $id, numberOfItems: $numberOfItems) {
      id
      numberOfItems
      product {
        name
      }
    }
  }
`);

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
  const [removeItemsFromUnboxedItemsCollectionMutation] = useMutation(
    REMOVE_ITEMS_FROM_UNBOXED_ITEMS_COLLECTION_MUTATION,
  );

  const [unassignBoxFromDistributionEventMutation] = useMutation(
    UNASSIGN_BOX_FROM_DISTRIBUTION_MUTATION,
  );

  const distributionEventId = distributionEventDetails.id;

  const onRemoveUnboxedItems = (unboxedItemsCollectionId: string, numberOfItems: number) => {
    const handleError = (errors: any) => {
      console.error(
        `Error while trying to remove items (${numberOfItems}) from unboxed items collection (unbox items collection id: ${unboxedItemsCollectionId}) from distribution event ${distributionEventId}`,
        errors,
      );
      toaster.create({
        title: "Error",
        description: "Couldn't remove items from distribution event. Please try again.",
        type: "error",
        duration: 2000,
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
          toaster.create({
            title: "Successfully removed items from distribution event. ",
            type: "success",
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
        toaster.create({
          title: "Error",
          description: "Box couldn't be unassigned from from the distribution event.",
          type: "error",
          duration: 2000,
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
        update: (cache) => {
          cache.modify({
            fields: {
              packingListEntriesForDistributionEvent() {},
            },
          });
        },
      })
        .then((res) => {
          if (res.errors && res.errors.length !== 0) {
            handleError(res.errors);
          } else {
            toaster.create({
              title: "Successfully unassigned box from distribution event. ",
              type: "success",
              duration: 2000,
            });
          }
        })
        .catch((error) => {
          handleError(error);
        });
    },
    [distributionEventId, unassignBoxFromDistributionEventMutation],
  );

  const contextValues: IDistroEventDetailsForPackingStateContext = {
    onUnassignBoxFromDistributionEvent,
    onRemoveUnboxedItems,
  };

  const { data, loading, error } = useQuery(PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY, {
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
