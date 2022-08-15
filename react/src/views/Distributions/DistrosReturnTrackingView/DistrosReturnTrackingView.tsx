import { useQuery } from "@apollo/client";
import { Box, Center, Heading, VStack } from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useSearchParams } from "react-router-dom";
import {
  DistributionEventsByIdsQuery,
  DistributionEventsByIdsQueryVariables,
} from "types/generated/graphql";
import { DISTRIBUTION_EVENTS_BY_IDS_QUERY } from "../queries";
import {
  DistributionEventDetails,
  DistributionEventDetailsSchema,
} from "../types";

const SummaryOfDistributionEvents = ({
  distributionEvents,
}: {
  distributionEvents: DistributionEventDetails[];
}) => {
  return (
    <Center>
      <Heading as={"h3"} size="md">
        Summary of Distribution Events
      </Heading>
    </Center>
  );
};

const DistrosReturnTrackingView = () => {
  const [searchParams] = useSearchParams();
  const distroEventIdsForReturnTracking =
    searchParams.getAll("distroEventIds[]");

  const { data, error, loading } = useQuery<
    DistributionEventsByIdsQuery,
    DistributionEventsByIdsQueryVariables
  >(DISTRIBUTION_EVENTS_BY_IDS_QUERY, {
    variables: {
      distributionEventIds: distroEventIdsForReturnTracking,
    },
  });

  if (loading) {
    return <APILoadingIndicator />;
  }
  if (error) {
    console.error("Error in DistrosReturnTrackingView : ", error);
    return <Center>Error!</Center>;
  }
  if (data?.distributionEvents == null) {
    console.error(
      "Problem in DistrosReturnTrackingView: data?.distributionEvents is undefined|null"
    );
    return <Center>Error!</Center>;
  }

  let distributionEventsData: DistributionEventDetails[];
  try {
    distributionEventsData = data?.distributionEvents.map((el) =>
      DistributionEventDetailsSchema.parse(el)
    );
  } catch (e) {
    console.error(
      "Problem in DistrosReturnTrackingView while parsing data.distributionEvents: ",
      e
    );
    return <Center>Error!</Center>;
  }
  //   DistributionEventDetailsSchema.parse(data?.distributionEvents[0])

  return (
    <VStack>
      <Heading>Track returns for the following events</Heading>
      <SummaryOfDistributionEvents
        distributionEvents={distributionEventsData}
      />
      <Box>
        {JSON.stringify(distroEventIdsForReturnTracking)}
        {JSON.stringify(data)}
      </Box>
      <h1>DistrosReturnTrackingView</h1>
    </VStack>
  );
};

export default DistrosReturnTrackingView;
