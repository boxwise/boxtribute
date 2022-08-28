import { useQuery } from "@apollo/client";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Center,
  Editable,
  EditableInput,
  EditablePreview,
  Heading,
  Input,
  List,
  ListItem,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import APILoadingIndicator from "components/APILoadingIndicator";
import _ from "lodash";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import {
  DistributionEventsTrackingGroupQuery,
  DistributionEventsTrackingGroupQueryVariables,
  DistributionEventsTrackingGroupState,
  DistributionEventTrackingFlowDirection,
} from "types/generated/graphql";
import { z } from "zod";
import DistributionEventTimeRangeDisplay from "../../components/DistributionEventTimeRangeDisplay";
import { DISTRIBUTION_EVENTS_TRACKING_GROUP_QUERY } from "../../queries";
import {
  DistributionEventDetails,
  DistributionEventDetailsSchema,
  Product,
  Size,
} from "../../types";

// interface ItemCollectionDataForReturnTracking {
//   productSizeIdTuple: string;
//   product?: Product | null;
//   size?: Size | null;
//   outgoingNumberOfItems: number;
//   trackedAsReturnedNumberOfItems: number;
//   // numberOfItems?: number | null;
// }

// TODO: get rid of this quite hack groupBy logic
// replace it e.g. by more elegant lodash method chaining
// Or, even better, by specific GraphQL/BE queries which return the required final outcome
// const squashByProductAndSizeWithSumForNumberOfItems = (
//   itemCollection: ItemCollectionDataForReturnTracking[]
// ) => {
//   const helper = new Map<string, ItemCollectionDataForReturnTracking>();
//   const result = itemCollection.reduce((r, o) => {
//     var key = o.product?.id + "-" + o.size?.id;

//     if (!helper.has(key)) {
//       const newEntry = Object.assign({}, o);
//       helper.set(key, newEntry);
//       r.push(newEntry);
//     } else {
//       const existingObject = helper.get(key)!;
//       existingObject.numberOfItems =
//         (existingObject.numberOfItems || 0) + (o.numberOfItems || 0);
//     }

//     return r;
//   }, [] as ItemCollectionDataForReturnTracking[]);
//   return result;
// };

interface ITrackingEntry {
  id: string;
  numberOfItems: number;
  flowDirection: DistributionEventTrackingFlowDirection;
  product?: Product | null;
  size?: Size | null;
}

// interface ITrackingEntriesByFlowDirection {
//   // flowDirection: string;
//   // trackingEntries: ITrackingEntry[];
//   numberOfItemsWentOut: number;
//   numberOfItemsReturned: number;
// }

interface ITrackingEntriesBySize {
  sizeId: string;
  sizeLabel: string;
  numberOfItemsWentOut: number;
  numberOfItemsReturned: number;
}

interface ITrackingEntriesByProduct {
  productId: string;
  productName: string;
  trackingEntriesBySize: ITrackingEntriesBySize[];
}

type ITrackingEntriesByProductAndSizeAndFlowDirection =
  ITrackingEntriesByProduct[];

interface IDistributionReturnTrackingSummary {
  distributionEvents: DistributionEventDetails[];
  trackingEntriesByProductAndSizeAndFlowDirection: ITrackingEntriesByProductAndSizeAndFlowDirection;
  // itemCollectionDataForReturnTracking: ItemCollectionDataForReturnTracking[];
}

const graphqlToDistributionEventStockSummary = (
  queryResult: DistributionEventsTrackingGroupQuery
): IDistributionReturnTrackingSummary => {
  const distributionEvents =
    queryResult.distributionEventsTrackingGroup?.distributionEvents || [];

  const distributionEventTrackingEntries =
    queryResult?.distributionEventsTrackingGroup
      ?.distributionEventsTrackingEntries || [];

  // TODO: consider to track/handle this as an error here
  // if (queryResult.distributionEventsTrackingGroup?.distributionEvents.length === 0) {
  // }

  const trackingEntriesByProductAndSizeAndFlowDirection: ITrackingEntriesByProductAndSizeAndFlowDirection =
    _(distributionEventTrackingEntries)
      // .groupBy(el => `${el.product.id}-${el.size.id}`)
      // .map((value, key) => ({ gender: ProductGender[key], products: value }))
      .groupBy((el) => el.product.id)
      .map((productGroup, productId) => ({
        productId,
        productName: productGroup[0].product.name,
        trackingEntriesBySize: _(productGroup)
          .groupBy((el2) => el2.size.id)
          .map((sizeGroup, sizeId) => ({
            sizeId,
            sizeLabel: sizeGroup[0]?.size.label,
            numberOfItemsWentOut: _(sizeGroup)
              .filter(
                (el) =>
                  el.flowDirection ===
                  DistributionEventTrackingFlowDirection.Out
              )
              .map((el) => el.numberOfItems)
              .sum(),
            numberOfItemsReturned: _(sizeGroup)
              .filter(
                (el) =>
                  el.flowDirection === DistributionEventTrackingFlowDirection.In
              )
              .map((el) => el.numberOfItems)
              .sum(),
            // _(sizeGroup)
            // .groupBy((trackingEntry) => trackingEntry.flowDirection)
            // .map((trackingEntries, flowDirection) => ({
            //   flowDirection,
            //   trackingEntries,
            // }))
            // .value(),
          }))
          .value(),
      }))
      // .filter(el => el.direction === DistributionEventTrackingFlowDirection.Out)
      .value();

  console.log("FOO", trackingEntriesByProductAndSizeAndFlowDirection);

  return {
    // squashedItemCollectionsAccrossAllEvents: queryResult.distributionEventsTrackingGroup?.distributionEventsTrackingEntries
    // squashedItemCollectionsAccrossAllEventsGroupedByProduct,

    distributionEvents: distributionEvents.map((el) =>
      DistributionEventDetailsSchema.parse(el)
    ),
    trackingEntriesByProductAndSizeAndFlowDirection,
    // itemCollectionDataForReturnTracking:
  };
};

const DistributionEventList = ({
  distributionEvents,
}: {
  distributionEvents: DistributionEventDetails[];
}) => {
  return (
    <VStack>
      <Heading size="md">
        You are tracking returns for the following Distribution Events
      </Heading>
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
          {/* <Box>Id: {distroEvent.id}</Box> */}
          <DistributionEventTimeRangeDisplay
            plannedStartDateTime={distroEvent.plannedStartDateTime}
            plannedEndDateTime={distroEvent.plannedEndDateTime}
          />
          <Box>
            {distroEvent.distributionSpot.name}
            {!!distroEvent.name && <> - ({distroEvent.name})</>}
          </Box>
        </Box>
      ))}
    </VStack>
  );
};

const SummaryOfItemsInDistributionEvents = ({
  trackingEntriesByProductAndSizeAndFlowDirection,
}: {
  // itemsCollectionsDataGroupedByProduct: {
  //   product: Product;
  trackingEntriesByProductAndSizeAndFlowDirection: ITrackingEntriesByProductAndSizeAndFlowDirection;
  // }[];
}) => {
  const TrackReturnsFormDataSchema = z.object({
    numberOfItemsForProductAndSize: z.array(
      z.object({
        productId: z.string(),
        sizeAndNumberOfItems: z.array(
          z.object({
            sizeId: z.string(),
            numberOfItems: z.number(),
          })
        ),
      })
    ),
  });

  type TrackReturnsFormData = z.infer<typeof TrackReturnsFormDataSchema>;

  // const methods = useForm<TrackReturnsFormData>({
  //   resolver: zodResolver(TrackReturnsFormDataSchema),
  // });
  // const { handleSubmit, register } = methods;

  // const onSubmit = (values: TrackReturnsFormData) => {
  //   alert(JSON.stringify(values));
  // };

  return (
    <VStack>
      <Heading size="md" mt={10}>
        Items in these Distribution Events
      </Heading>
      {/* <form onSubmit={handleSubmit(onSubmit)}> */}
      <List>
        {trackingEntriesByProductAndSizeAndFlowDirection.map(
          (squashedItemsCollectionsGroupForProduct) => {
            const productId = squashedItemsCollectionsGroupForProduct.productId;
            return (
              <ListItem key={productId} mt={10}>
                <Heading
                  as="h3"
                  size="md"
                  textAlign="center"
                  borderColor="red.500"
                  borderWidth={1}
                  backgroundColor="gray.50"
                  p={3}
                  my={2}
                >
                  <b>Product:</b>{" "}
                  {squashedItemsCollectionsGroupForProduct.productName}
                </Heading>
                <List>
                  {squashedItemsCollectionsGroupForProduct.trackingEntriesBySize.map(
                    (productSizeWithNumberOfItemsTuple) => {
                      const sizeId = productSizeWithNumberOfItemsTuple.sizeId;
                      return (
                        <ListItem
                          mb={3}
                          backgroundColor="gray.50"
                          p={3}
                          key={sizeId}
                        >
                          <Box>
                            <b>Size:</b>{" "}
                            {productSizeWithNumberOfItemsTuple.sizeLabel}
                          </Box>
                          <Box>
                            <b>Number of items on distro :</b>{" "}
                            {
                              productSizeWithNumberOfItemsTuple.numberOfItemsWentOut
                            }
                          </Box>
                          <Box>
                            {/* <Editable
                                // backgroundColor={
                                //   entry.numberOfItems > 0
                                //     ? "organe.100"
                                //     : "transparent"
                                // }
                                value={numberOfItemsFormValue.toString()}
                                onChange={(newVal) =>
                                  setNumberOfItemsFormValue(parseInt(newVal))
                                }
                                onSubmit={onChangeHandlerForEntry}
                              >
                                <EditablePreview width={20} />
                                <EditableInput width={20} type="number" />
                              </Editable> */}
                          </Box>
                        </ListItem>
                      );
                    }
                  )}
                </List>
              </ListItem>
            );
          }
        )}
      </List>
      <Button my={2} colorScheme="blue" type="submit">
        Done with counting the returned items. *
      </Button>
      {/* </form> */}
    </VStack>
  );
};

const DistrosReturnTrackingGroupView = () => {
  const { trackingGroupId } = useParams<{
    baseId: string;
    trackingGroupId: string;
  }>();

  const { data, error, loading } = useQuery<
    DistributionEventsTrackingGroupQuery,
    DistributionEventsTrackingGroupQueryVariables
  >(DISTRIBUTION_EVENTS_TRACKING_GROUP_QUERY, {
    variables: {
      trackingGroupId: trackingGroupId!,
    },
  });

  const onConfirmToMarkEventAsCompleted = () => {
    alert("Not implemented yet");
  };

  const confirmFinishingReturnTrackingAlertState = useDisclosure();
  const cancelNextStageTransitionRef = useRef<HTMLButtonElement>(null);

  if (loading) {
    return <APILoadingIndicator />;
  }
  if (error) {
    console.error("Error in DistrosReturnTrackingView : ", error);
    return <Center>Error!</Center>;
  }
  if (data?.distributionEventsTrackingGroup == null) {
    console.error(
      "Problem in DistrosReturnTrackingView: distributionEvents is undefined|null"
    );
    return <Center>Error!</Center>;
  }

  const distributionEventsSummary =
    graphqlToDistributionEventStockSummary(data);

  console.log("data", data);

  return (
    <VStack>
      <DistributionEventList
        distributionEvents={distributionEventsSummary.distributionEvents}
      />
      <SummaryOfItemsInDistributionEvents
        trackingEntriesByProductAndSizeAndFlowDirection={
          distributionEventsSummary.trackingEntriesByProductAndSizeAndFlowDirection
        }
      />
      <Text size="small">
        * This will track all left over number of items as "Distributed".
      </Text>

      <AlertDialog
        isOpen={confirmFinishingReturnTrackingAlertState.isOpen}
        leastDestructiveRef={cancelNextStageTransitionRef}
        onClose={confirmFinishingReturnTrackingAlertState.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Mark Distribution Event as Completed
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you tracked all returned items properly? It will end
              up in setting all Boxes assigned to the Distribution Events to
              zero. The system will then also calculate the number of
              distributed items for each Product/Size combination involved in
              the Distributions. This data will be used for Monitoring and
              Evaluation purposes. You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelNextStageTransitionRef}
                onClick={confirmFinishingReturnTrackingAlertState.onClose}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={onConfirmToMarkEventAsCompleted}
                ml={3}
              >
                Mark Event as Completed
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default DistrosReturnTrackingGroupView;
