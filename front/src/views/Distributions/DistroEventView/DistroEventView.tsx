import { useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useParams } from "react-router-dom";
import {
  DistributionEventQuery,
  DistributionEventQueryVariables
} from "types/generated/graphql";
import { DISTRIBUTION_EVENT_QUERY } from "../queries";
import { DistributionEventDetails, DistributionEventDetailsSchema } from "../types";
import DistroEventContainer from "./components/DistroEventContainer";

const graphqlToContainerTransformer = (
  distributionEventData: DistributionEventQuery | undefined
): DistributionEventDetails => {

  if(distributionEventData?.distributionEvent?.distributionSpot == null) {
    throw new Error("distributionEventData.distributionEvent.distributionSpot is null");
  }
  return DistributionEventDetailsSchema.parse(distributionEventData?.distributionEvent);
};

const DistroEventView = () => {
  const eventId = useParams<{ eventId: string }>().eventId;

  const { data, error, loading } = useQuery<
    DistributionEventQuery,
    DistributionEventQueryVariables
  >(DISTRIBUTION_EVENT_QUERY, {
    variables: {
      eventId: eventId!,
    },
    // pollInterval: 5000
  });

  if (loading) {
    return <APILoadingIndicator />;
  }

  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }

  const transformedData = graphqlToContainerTransformer(data);

    return <DistroEventContainer distributionEventDetails={transformedData} />;
};

export default DistroEventView;
