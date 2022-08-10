import { useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import {
  PackingListEntriesForDistributionEventQuery,
  PackingListEntriesForDistributionEventQueryVariables
} from "types/generated/graphql";
import { graphqlPackingListEntriesForDistributionEventTransformer } from "views/Distributions/dataTransformers";
import { PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY } from "views/Distributions/queries";
import {
  DistributionEventDetails
} from "views/Distributions/types";
import DistroEventDetailsForPackingState from "./DistroEventDetailsForPackingState";

interface DistroEventDetailsForPackingStateProps {
  distributionEventDetails: DistributionEventDetails;
}

const DistroEventDetailsForPackingStateContainer = ({
  distributionEventDetails,
}: DistroEventDetailsForPackingStateProps) => {
  // const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, loading, error } = useQuery<
    PackingListEntriesForDistributionEventQuery,
    PackingListEntriesForDistributionEventQueryVariables
  >(PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY, {
    variables: { distributionEventId: distributionEventDetails.id },
    pollInterval: 5000,
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
  );
};

export default DistroEventDetailsForPackingStateContainer;
