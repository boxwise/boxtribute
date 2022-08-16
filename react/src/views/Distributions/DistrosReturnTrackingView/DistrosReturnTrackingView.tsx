import { useQuery } from "@apollo/client";
import { Box, Center, Heading, VStack } from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import _ from "lodash";
import { useParams, useSearchParams } from "react-router-dom";
import {
  DistributionEventsInReturnStateForBaseQuery,
  DistributionEventsInReturnStateForBaseQueryVariables,
} from "types/generated/graphql";
import DistributionEventTimeRangeDisplay from "../components/DistributionEventTimeRangeDisplay";
import { DISTRIBUTION_EVENTS_IN_RETURN_STATE_FOR_BASE } from "../queries";
import {
  DistributionEventDetails,
  DistributionEventDetailsSchema,
} from "../types";

const graphqlToDistributionEventStockSummary = (
  queryResult: DistributionEventsInReturnStateForBaseQuery,
  distributionEventsToFilterFor: string[]
) => {
  const distributionEvents = queryResult.base?.distributionEventsInReturnState;
  if (!distributionEvents) {
    // TODO: consider to track/handle this as an error here
    return [];
  }
  // TODO: consider to move this rather complex set operations/transformations into backend.
  //   something like getStockSummaryForDistributionEventsById
  const FOO = _(distributionEvents)
    .filter((distributionEvent) =>
      distributionEventsToFilterFor.includes(distributionEvent.id)
    )
    .map((distroEvent) => {
      const unboxedItemsCollectionsByProductAndSizeId = _(
        distroEvent.unboxedItemsCollections
      )
        .keyBy((itemsCol) => `${itemsCol.product?.id!}-${itemsCol.size.id}`)
        // .merge(
        //   _(distroEvent.boxes)
        //     .keyBy((itemsCol) => `${itemsCol.product?.id!}-${itemsCol.size.id}`)
        //     .value()
        // )

        .values()
        .map((el) => ({
          product: el.product,
          size: el.size,
          numberOfItems: el.items,
        }))
        .value();

      const boxesByProductAndSizeId = _(distroEvent.boxes)
        .keyBy((b) => `${b.product?.id!}-${b.size.id}`)
        .map((el, id) => ({
          product: el.product,
          size: el.size,
          numberOfItems: el.items,
        }))
        .value();

      console.log(
        "unboxedItemsCollectionsByProductAndSizeId",
        unboxedItemsCollectionsByProductAndSizeId
      );
      console.log("boxesByProductAndSizeId", boxesByProductAndSizeId);

      const combined = _.concat(
        unboxedItemsCollectionsByProductAndSizeId,
        boxesByProductAndSizeId
      );

      _(combined).groupBy().map();

      console.log("combined", combined);

      return [];
    })
    .value();
  console.log("FOO", FOO);
  return FOO;
};

const SummaryOfDistributionEvents = ({
  distributionEvents,
}: {
  distributionEvents: DistributionEventDetails[];
}) => {
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
  const [searchParams] = useSearchParams();
  const distroEventIdsForReturnTracking =
    searchParams.getAll("distroEventIds[]");
  const baseId = useParams<{ baseId: string }>().baseId!;

  const { data, error, loading } = useQuery<
    DistributionEventsInReturnStateForBaseQuery,
    DistributionEventsInReturnStateForBaseQueryVariables
  >(DISTRIBUTION_EVENTS_IN_RETURN_STATE_FOR_BASE, {
    variables: {
      baseId,
    },
  });

  if (loading) {
    return <APILoadingIndicator />;
  }
  if (error) {
    console.error("Error in DistrosReturnTrackingView : ", error);
    return <Center>Error!</Center>;
  }
  if (data?.base?.distributionEventsInReturnState == null) {
    console.error(
      "Problem in DistrosReturnTrackingView: data?.distributionEvents is undefined|null"
    );
    return <Center>Error!</Center>;
  }

  //   let distributionEventsData: DistributionEventDetails[];
  //   try {
  //     distributionEventsData = data?.base?.distributionEventsInReturnState.map(
  //       (el) => DistributionEventDetailsSchema.parse(el)
  //     );
  //   } catch (e) {
  //     console.error(
  //       "Problem in DistrosReturnTrackingView while parsing data.distributionEvents: ",
  //       e
  //     );
  //     return <Center>Error!</Center>;
  //   }
  console.log(
    "distroEventIdsForReturnTracking",
    distroEventIdsForReturnTracking
  );
  console.log("data", data);
  const distributionEventsStockSummary = graphqlToDistributionEventStockSummary(
    data,
    distroEventIdsForReturnTracking
  );

  return (
    <VStack>
      <Heading>Track returns for the following events</Heading>
      <SummaryOfDistributionEvents distributionEvents={[]} />
      <Box>
        {/* {JSON.stringify(distroEventIdsForReturnTracking)}
        {JSON.stringify(data)} */}
      </Box>
      <h1>DistrosReturnTrackingView</h1>
    </VStack>
  );
};

export default DistrosReturnTrackingView;
