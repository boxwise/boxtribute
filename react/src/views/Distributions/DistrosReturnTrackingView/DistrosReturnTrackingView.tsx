import { useQuery } from "@apollo/client";
import { Box, Center } from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useSearchParams } from "react-router-dom";
import { DistributionEventsByIdsQuery, DistributionEventsByIdsQueryVariables } from "types/generated/graphql";
import { DISTRIBUTION_EVENTS_BY_IDS_QUERY } from "../queries";

const DistrosReturnTrackingView = () => {
  const [searchParams] = useSearchParams();
  const distroEventIdsForReturnTracking = searchParams.getAll("distroEventIds[]");

  const {data, error, loading} = useQuery<DistributionEventsByIdsQuery, DistributionEventsByIdsQueryVariables>(DISTRIBUTION_EVENTS_BY_IDS_QUERY, {
    variables: {
        distributionEventIds: distroEventIdsForReturnTracking,
    },
  });


  if (loading) {
    return <APILoadingIndicator />;
  }
  if (error) {
    console.error(
      "Error in DistrosReturnTrackingView : ",
      error
    );
    return <Center>Error!</Center>;
  }


  return (
    <Box>
        {JSON.stringify(distroEventIdsForReturnTracking)}
      <h1>DistrosReturnTrackingView</h1>
    </Box>
  );
};

export default DistrosReturnTrackingView;
