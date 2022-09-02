import { useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useParams } from "react-router-dom";
import {
  DataForReturnTrackingOverviewForBaseQuery,
  DataForReturnTrackingOverviewForBaseQueryVariables,
} from "types/generated/graphql";
import { z } from "zod";
import { DATA_FOR_RETURN_TRACKING_OVERVIEW_FOR_BASE_QUERY } from "../../queries";
import {
  DistributionEventDetailsSchema,
  DistributionTrackingGroup,
  DistributionTrackingGroupSchema,
} from "../../types";
import DistributionListForReturnTracking from "./components/DistributionListForReturnTracking";

const DistributionReturnTrackingsView = () => {
  const baseId = useParams<{ baseId: string }>().baseId;

  const { data, error, loading } = useQuery<
    DataForReturnTrackingOverviewForBaseQuery,
    DataForReturnTrackingOverviewForBaseQueryVariables
    // TODO: consider to move this into a container (so this view file only extracts the baseId from the url params)
  >(DATA_FOR_RETURN_TRACKING_OVERVIEW_FOR_BASE_QUERY, {
    variables: {
      baseId: baseId!,
    },
  });

  if (loading) return <APILoadingIndicator />;
  // TODO: add error logging here
  if (error) return <div>Error: {error.message}</div>;

  if (data?.base?.distributionEvents == null) return <div>Error: No data</div>;

  const parsedDistributionEventsData = z
    .array(DistributionEventDetailsSchema)
    .parse(data?.base?.distributionEvents);

  const distributionEventsTrackingGroups: DistributionTrackingGroup[] = z
    .array(DistributionTrackingGroupSchema)
    .parse(data?.base?.distributionEventsTrackingGroups);

  return (
    <DistributionListForReturnTracking
      distributionEventsData={parsedDistributionEventsData}
      returnTrackingGroups={distributionEventsTrackingGroups}
    />
  );
};

export default DistributionReturnTrackingsView;
