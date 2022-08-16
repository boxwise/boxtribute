import { useQuery } from "@apollo/client";
import { Box, Center, Heading, List, ListItem, VStack } from "@chakra-ui/react";
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
  Product,
  Size,
} from "../types";

interface ItemCollection {
  productSizeIdTuple: string;
  product?: Product | null;
  size?: Size | null;
  numberOfItems?: number | null;
}

// TODO: get rid of this quite hack groupBy logic
// replace it e.g. by more elegant lodash method chaining
// Or, even better, by specific GraphQL/BE queries which return the required final outcome
const groupByProductAndSizeWithSumForNumberOfItems = (
  itemCollection: ItemCollection[]
) => {
  const helper = new Map<string, ItemCollection>();
  const result = itemCollection.reduce((r, o) => {
    var key = o.product?.id + "-" + o.size?.id;

    if (!helper.has(key)) {
      const newEntry = Object.assign({}, o);
      helper.set(key, newEntry);
      r.push(newEntry);
    } else {
      const existingObject = helper.get(key)!;
      existingObject.numberOfItems =
        (existingObject.numberOfItems || 0) + (o.numberOfItems || 0);
    }

    return r;
  }, [] as ItemCollection[]);
  return result;
};

const graphqlToDistributionEventStockSummary = (
  queryResult: DistributionEventsInReturnStateForBaseQuery,
  distributionEventsToFilterFor: string[]
) => {
  const distributionEvents =
    queryResult.base?.distributionEventsInReturnState || [];
  // TODO: consider to track/handle this as an error here
  // if (distributionEvents.length === 0) {
  // }
  // TODO: consider to move this rather complex set operations/transformations into backend.
  //   something like getStockSummaryForDistributionEventsById
  const filteredDistributionEvents = _(distributionEvents)
    .filter((distributionEvent) =>
      distributionEventsToFilterFor.includes(distributionEvent.id)
    )
    .value();

  const squashedItemCollectionsAccrossAllEvents = _(filteredDistributionEvents)
    .flatMap((distroEvent) =>
      _(distroEvent.boxes)
        .map(
          (el) =>
            ({
              product: el.product,
              size: el.size,
              numberOfItems: el.items,
            } as ItemCollection)
        )
        .concat(
          distroEvent.unboxedItemsCollections?.map(
            (el) =>
              ({
                product: el.product,
                size: el.size,
                numberOfItems: el.items,
              } as ItemCollection)
          ) || []
        )
        .value()
    )
    .thru(groupByProductAndSizeWithSumForNumberOfItems)
    .value();
  // .map((distroEvent) => {
  //   const unboxedItemsCollectionsByProductAndSizeId = _(
  //     distroEvent.unboxedItemsCollections
  //   )
  //     .keyBy((itemsCol) => `${itemsCol.product?.id!}-${itemsCol.size.id}`)
  //     // .merge(
  //     //   _(distroEvent.boxes)
  //     //     .keyBy((itemsCol) => `${itemsCol.product?.id!}-${itemsCol.size.id}`)
  //     //     .value()
  //     // )

  //     // .values()
  //     .map((el, id) => ({
  //       productSizeIdTuple: id,
  //       product: el.product,
  //       size: el.size,
  //       numberOfItems: el.items,
  //     }))
  //     .value();

  //   const boxesByProductAndSizeId = _(distroEvent.boxes)
  //     .keyBy((b) => `${b.product?.id!}-${b.size.id}`)
  //     .map((el, id) => ({
  //       productSizeIdTuple: id,
  //       product: el.product,
  //       size: el.size,
  //       numberOfItems: el.items,
  //     }))
  //     .value();

  //   console.log(
  //     "unboxedItemsCollectionsByProductAndSizeId",
  //     unboxedItemsCollectionsByProductAndSizeId
  //   );
  //   console.log("boxesByProductAndSizeId", boxesByProductAndSizeId);

  //   const combined: ItemCollection[] = _.concat(
  //     unboxedItemsCollectionsByProductAndSizeId,
  //     boxesByProductAndSizeId
  //   );

  //   const BAR = _(combined)
  //   .groupBy("productSizeIdTuple")
  //   // .groupBy(el => ({
  //   //   product: el.product,
  //   //   size: el.size
  //   // }))
  //   // .value
  //   .map((el, id) => ({
  //     productSizeIdTuple: id,
  //     product: el.product,

  //   });

  //   console.log("combined", combined);

  //   return [];
  // })
  // .value();
  console.log("FOO", squashedItemCollectionsAccrossAllEvents);

  return {
    squashedItemCollectionsAccrossAllEvents,
    distributionEvents: filteredDistributionEvents.map((el) =>
      DistributionEventDetailsSchema.parse(el)
    ),
    // distributionEvents: filteredDistributionEvents.map(el => ({
    //   id: el.id,
    //   name: el.name,
    //   plannedStartDateTime: el.plannedStartDateTime
    // } as DistributionEventDetails))
  };
};

const SummaryOfDistributionEvents = ({
  squashedItemsCollections,
  distributionEvents,
}: {
  squashedItemsCollections: ItemCollection[];
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
      <List>
        {squashedItemsCollections.map((el, i) => (
          <ListItem key={i}>
            <Box>
              <b>Product:</b> {el.product?.name}
            </Box>
            <Box>
              <b>Size:</b> {el.size?.label}
            </Box>
            <Box>
              <b>Number of items:</b> {el.numberOfItems}
            </Box>
          </ListItem>
        ))}
      </List>
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
  const distributionEventsSummary = graphqlToDistributionEventStockSummary(
    data,
    distroEventIdsForReturnTracking
  );

  return (
    <VStack>
      <Heading>Track returns for the following events</Heading>
      <SummaryOfDistributionEvents
        squashedItemsCollections={
          distributionEventsSummary.squashedItemCollectionsAccrossAllEvents
        }
        distributionEvents={distributionEventsSummary.distributionEvents}
      />
      <Box>
        {/* {JSON.stringify(distroEventIdsForReturnTracking)}
        {JSON.stringify(data)} */}
      </Box>
    </VStack>
  );
};

export default DistrosReturnTrackingView;
