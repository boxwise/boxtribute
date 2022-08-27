import { useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useNavigate, useParams } from "react-router-dom";
import {
  DistributionEventsForBaseQuery,
  DistributionEventsForBaseQueryVariables,
} from "types/generated/graphql";
import { z } from "zod";
import { DISTRIBUTION_EVENTS_FOR_BASE_ID } from "../../queries";
import {
  DistributionEventDetailsSchema,
} from "../../types";
import DistributionListForReturnTracking from "./components/DistributionListForReturnTracking";

const DistributionReturnTrackingsView = () => {
  const baseId = useParams<{ baseId: string }>().baseId;

  const navigate = useNavigate();
  // TODO: consider to extract this out into custom hook (if it really makes sense!)

  const { data, error, loading } = useQuery<
    DistributionEventsForBaseQuery,
    DistributionEventsForBaseQueryVariables
    // TODO: consider to move this into a container (so this view file only extracts the baseId from the url params)
  >(DISTRIBUTION_EVENTS_FOR_BASE_ID, {
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

  return (
    <DistributionListForReturnTracking
      distributionEventsData={parsedDistributionEventsData}
    />
  );
};

export default DistributionReturnTrackingsView;
