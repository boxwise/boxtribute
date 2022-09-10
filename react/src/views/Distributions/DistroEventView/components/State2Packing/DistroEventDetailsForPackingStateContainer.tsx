import { useMutation, useQuery } from "@apollo/client";
import { useToast } from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { createContext, useCallback } from "react";
import {
  PackingListEntriesForDistributionEventQuery,
  PackingListEntriesForDistributionEventQueryVariables,
  UnassignBoxFromDistributionEventMutation,
  UnassignBoxFromDistributionEventMutationVariables,
} from "types/generated/graphql";
import { BOX_BY_LABEL_IDENTIFIER_QUERY } from "views/Box/BoxView";
import { graphqlPackingListEntriesForDistributionEventTransformer } from "views/Distributions/dataTransformers";
import {
  DISTRIBUTION_EVENT_QUERY,
  PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
  UNASSIGN_BOX_FROM_DISTRIBUTION_MUTATION,
} from "views/Distributions/queries";
import { DistributionEventDetails } from "views/Distributions/types";
import DistroEventDetailsForPackingState from "./DistroEventDetailsForPackingState";

interface IDistroEventDetailsForPackingStateContext {
  onUnassignBoxFromDistributionEvent: (labelIdentifier: string) => void;
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

  const [unassignBoxFromDistributionEventMutation] = useMutation<
    UnassignBoxFromDistributionEventMutation,
    UnassignBoxFromDistributionEventMutationVariables
  >(UNASSIGN_BOX_FROM_DISTRIBUTION_MUTATION);

  const distributionEventId = distributionEventDetails.id;
  const onUnassignBoxFromDistributionEvent = useCallback(
    (boxLabelIdentifier: string) => {
      const handleError = (errors: any) => {
        console.error(
          `Error while trying to unassign box (label identifier: ${boxLabelIdentifier}) from distribution event ${distributionEventId}`,
          errors
        );
        toast({
          title: "Error",
          description:
            "Box couldn't be unassigned from from the distribution event.",
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
              distributionEventId
            }
          },
          {
            query: BOX_BY_LABEL_IDENTIFIER_QUERY,
            variables: {
              labelIdentifier: boxLabelIdentifier
            }
          }
        ],
        update: (cache, { data }) => {
          cache.modify({
            fields: {
              packingListEntriesForDistributionEvent(existingPackingListEntries) {
              }
            }
          });
        }
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
    [distributionEventId, toast, unassignBoxFromDistributionEventMutation]
  );

  const contextValues: IDistroEventDetailsForPackingStateContext = {
    onUnassignBoxFromDistributionEvent,
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
  const packingListEntries =
    graphqlPackingListEntriesForDistributionEventTransformer(data);

  if (packingListEntries == null) {
    return <div>Error: No data found</div>;
  }

  return (
    <DistroEventDetailsForPackingStateContext.Provider value={contextValues}>
      <DistroEventDetailsForPackingState
        packingListEntries={packingListEntries}
        distributionEventId={distributionEventDetails.id}
        // onShowListClick={() => {}}
        // boxData={{
        //   id: "1",
        //   labelIdentifier: "12345",
        //   productName: "Product Name",
        //   size: "S",
        //   numberOfItems: 3,
        // }}
        // boxesData={[]}
        // packingActionProps={{
        //   onBoxToDistribution: () => {},
        //   onMoveItemsToDistribution: () => {},
        // }}
        // packingActionListProps={{
        //   onDeleteBoxFromDistribution: () => {}
        // }}
      />
    </DistroEventDetailsForPackingStateContext.Provider>
  );
};

export default DistroEventDetailsForPackingStateContainer;
