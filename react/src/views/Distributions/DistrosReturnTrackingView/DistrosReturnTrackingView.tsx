import { Box, Heading, VStack } from "@chakra-ui/react";
import DistributionEventTimeRangeDisplay from "../components/DistributionEventTimeRangeDisplay";
import { DistributionEventDetails } from "../types";

const SummaryOfDistributionEvents = ({
  distributionEvents,
}: {
  distributionEvents: DistributionEventDetails[];
}) => {
  console.log("FOO", distributionEvents);
  return (
    <VStack>
      {/* <Heading as={"h3"} size="md">
        Summary of Distribution Events
      </Heading> */}
      {distributionEvents.map((distroEvent) => (
        <Box
          key={distroEvent.id}
          maxW="sm"
          p="5"
          borderWidth="1px"
          rounded="md"
        >
          <DistributionEventTimeRangeDisplay
            plannedStartDateTime={distroEvent.plannedStartDateTime}
            plannedEndDateTime={distroEvent.plannedEndDateTime}
          />

          <Heading size="md" my="2">
            {distroEvent.distributionSpot.name}{" "}
            {!!distroEvent.name && <>({distroEvent.name})</>}
          </Heading>
        </Box>
      ))}
    </VStack>
  );
};

const DistrosReturnTrackingView = () => {
//   const [searchParams] = useSearchParams();
//   const distroEventIdsForReturnTracking =
//     searchParams.getAll("distroEventIds[]");


//   const { data, error, loading } = useQuery<
//     DistributionEventsSummaryByIdsQuery,
//     DistributionEventsSummaryByIdsQueryVariables
//   >(DISTRIBUTION_EVENTS_SUMMARY_BY_IDS_QUERY, {
//     variables: {
//       distributionEventIds: distroEventIdsForReturnTracking,
//     },
//   });

//   if (loading) {
//     return <APILoadingIndicator />;
//   }
//   if (error) {
//     console.error("Error in DistrosReturnTrackingView : ", error);
//     return <Center>Error!</Center>;
//   }
//   if (data?.distributionEventsSummary?.distributionEvents == null) {
//     console.error(
//       "Problem in DistrosReturnTrackingView: data?.distributionEvents is undefined|null"
//     );
//     return <Center>Error!</Center>;
//   }

//   let distributionEventsData: DistributionEventDetails[];
//   try {
//     distributionEventsData = data?.distributionEventsSummary?.distributionEvents.map((el) =>
//       DistributionEventDetailsSchema.parse(el)
//     );
//   } catch (e) {
//     console.error(
//       "Problem in DistrosReturnTrackingView while parsing data.distributionEvents: ",
//       e
//     );
//     return <Center>Error!</Center>;
//   }
  //   DistributionEventDetailsSchema.parse(data?.distributionEvents[0])

  const distributionEventsData = [];

  return (
    <VStack>
      <Heading>Track returns for the following events</Heading>
      <SummaryOfDistributionEvents
        distributionEvents={distributionEventsData}
      />
      <Box>
        {/* {JSON.stringify(distroEventIdsForReturnTracking)}
        {JSON.stringify(data)} */}
      </Box>
      <h1>DistrosReturnTrackingView</h1>
    </VStack>
  );
};

export default DistrosReturnTrackingView;
