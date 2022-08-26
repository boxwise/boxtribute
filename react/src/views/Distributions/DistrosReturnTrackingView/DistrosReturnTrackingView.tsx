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
import { useForm, useFieldArray } from "react-hook-form";
import { useParams, useSearchParams } from "react-router-dom";
import {
  DistributionEventsInReturnStateForBaseQuery,
  DistributionEventsInReturnStateForBaseQueryVariables,
  DistributionEventsTrackingGroupQuery,
  DistributionEventsTrackingGroupQueryVariables,
} from "types/generated/graphql";
import { z } from "zod";
import DistributionEventTimeRangeDisplay from "../components/DistributionEventTimeRangeDisplay";
import { DISTRIBUTION_EVENTS_IN_RETURN_STATE_FOR_BASE, DISTRIBUTION_EVENTS_TRACKING_GROUP_QUERY } from "../queries";
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
const squashByProductAndSizeWithSumForNumberOfItems = (
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
  queryResult: DistributionEventsTrackingGroupQuery,
) => {
  const distributionEvents =
    queryResult.distributionEventsTrackingGroup?.distributionEvents || [];
  // TODO: consider to track/handle this as an error here
  // if (distributionEvents.length === 0) {
  // }
  // TODO: consider to move this rather complex set operations/transformations into backend.
  //   something like getStockSummaryForDistributionEventsById
  // const filteredDistributionEvents = _(distributionEvents)
  //   .filter((distributionEvent) =>
  //     distributionEventsToFilterFor.includes(distributionEvent.id)
  //   )
  //   .value();

  const squashedItemCollectionsAccrossAllEventsGroupedByProduct = _(
    // filteredDistributionEvents
    distributionEvents
  )
    .flatMap((distroEvent) =>
      _(distroEvent.boxes)
        .map(
          (el) =>
            ({
              product: el.product,
              size: el.size,
              numberOfItems: el.numberOfItems,
            } as ItemCollection)
        )
        .concat(
          distroEvent.unboxedItemsCollections?.map(
            (el) =>
              ({
                product: el.product,
                size: el.size,
                numberOfItems: el.numberOfItems,
              } as ItemCollection)
          ) || []
        )
        .value()
    )
    .thru(squashByProductAndSizeWithSumForNumberOfItems)
    .groupBy((el) => el.product?.id)
    .map((value) => ({
      // TODO: look into proper parsing/validation overall
      // here, but also across all other API response related code
      product: value[0]?.product!,
      productSizeWithNumerOfItemsTuples: value,
    }))
    .value();

  return {
    squashedItemCollectionsAccrossAllEvents:
      squashedItemCollectionsAccrossAllEventsGroupedByProduct,
    distributionEvents: distributionEvents.map((el) =>
      DistributionEventDetailsSchema.parse(el)
    ),
    // distributionEvents: filteredDistributionEvents.map(el => ({
    //   id: el.id,
    //   name: el.name,
    //   plannedStartDateTime: el.plannedStartDateTime
    // } as DistributionEventDetails))
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
  squashedItemsCollectionsGroupedByProduct,
}: {
  squashedItemsCollectionsGroupedByProduct: {
    product: Product;
    productSizeWithNumerOfItemsTuples: ItemCollection[];
  }[];
}) => {

  // interface TrackReturnsFormDat {

  // }


// z.object().shape({
//   countries: yup.array(
//     yup.object().shape({
//       name: yup.string().required(),
//       cities: yup.array(
//         yup.object().shape({
//           name: yup.string().required(),
//           description: yup.string()
//         })
//       )
//     })
//   )
// });

// export type CreateBoxFormData = z.infer<typeof CreateBoxFormDataSchema>;
// } = useForm<BoxFormValues>({
//   resolver: zodResolver(CreateBoxFormDataSchema),
//   defaultValues: {
//     numberOfItems: 0,
//     qrCode: qrCode,
//   },
// });



const TrackReturnsFormDataSchema = z.object({
  numberOfItemsForProductAndSize: z.array(
    z.object({
      productId: z.string(),
      sizeId: z.string(),
      numberOfItems: z.number(),
    })
  )
});

type TrackReturnsFormData = z.infer<typeof TrackReturnsFormDataSchema>;


  const methods = useForm<TrackReturnsFormData>({
    resolver: zodResolver(TrackReturnsFormDataSchema),
    // defaultValues,
    // mode: "onChange"
  });
  const { control, watch, handleSubmit, register } = methods;

  // const { fields, append, remove } = useFieldArray({
  //   control,
  //   name: "numberOfItemsForProductAndSize"
  // });


  return (
    <VStack>
      <Heading size="md" mt={10}>
        Items in these Distribution Events
      </Heading>
      <List>
        {squashedItemsCollectionsGroupedByProduct.map(
          (squashedItemsCollectionsGroupForProduct) => (
            <ListItem
              key={squashedItemsCollectionsGroupForProduct.product.id}
              mt={10}
            >
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
                {squashedItemsCollectionsGroupForProduct.product?.name}
              </Heading>
              <List>
                {squashedItemsCollectionsGroupForProduct.productSizeWithNumerOfItemsTuples.map(
                  (productSizeWithNumberOfItemsTuple, i) => (
                    <ListItem mb={3} backgroundColor="gray.50" p={3}>
                      <Box>
                        <b>Size:</b>{" "}
                        {productSizeWithNumberOfItemsTuple.size?.label}
                      </Box>
                      <Box>
                        <b>Number of items on distro :</b>{" "}
                        {productSizeWithNumberOfItemsTuple.numberOfItems}
                      </Box>
                      <Box>
                        <input hidden {...register(`numberOfItemsForProductAndSize.${i}.productId`)} defaultValue={squashedItemsCollectionsGroupForProduct.product.id} />
                        <input hidden {...register(`numberOfItemsForProductAndSize.${i}.sizeId`)} defaultValue={productSizeWithNumberOfItemsTuple.size?.id} />
                        <Input
                          // placeholder={distroEvent.eventDate?.toDateString()}
                          type="number"
                          mb={4}
                          {...register(
                            `numberOfItemsForProductAndSize.${i}.numberOfItems`,
                            { required: false }
                          )}
                        />
                      </Box>
                      {/* <Box>
                        <Button>Track more items as returned</Button>
                      </Box> */}
                    </ListItem>
                  )
                )}
              </List>
            </ListItem>
          )
        )}
      </List>
    </VStack>
  );
};

const DistrosReturnTrackingView = () => {
  // const [searchParams] = useSearchParams();
  // const distroEventIdsForReturnTracking =
  //   searchParams.getAll("distroEventIds[]");
  const {baseId, trackingGroupId } = useParams<{ baseId: string, trackingGroupId: string }>();

  const { data, error, loading } = useQuery<
  DistributionEventsTrackingGroupQuery,
  DistributionEventsTrackingGroupQueryVariables
  >(DISTRIBUTION_EVENTS_TRACKING_GROUP_QUERY, {
    variables: {
      // baseId: baseId!,
      trackingGroupId: trackingGroupId!,
    },
  });

  const onConfirmToMarkEventAsCompleted = () => {
    alert("Not implemented yet");
  }

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

  const distributionEventsSummary = graphqlToDistributionEventStockSummary(
    data,
  );

  return (
    <VStack>
      <DistributionEventList
        distributionEvents={distributionEventsSummary.distributionEvents}
      />
      <SummaryOfItemsInDistributionEvents
        squashedItemsCollectionsGroupedByProduct={
          distributionEventsSummary.squashedItemCollectionsAccrossAllEvents
        }
      />
      <Button
        my={2}
        onClick={() => alert("Not yet implemented")}
        colorScheme="blue"
      >
       Done with counting the returned items. *
      </Button>
      <Text size="small">* This will track all left over number of items as "Distributed".</Text>
      <Box>
        {/* {JSON.stringify(distroEventIdsForReturnTracking)}
        {JSON.stringify(data)} */}
      </Box>


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
              Are you sure you tracked all returned items properly? It will end up in setting all Boxes assigned to the Distribution Events to zero. The system will then also calculate the number of distributed items for each Product/Size combination involved in the Distributions. This data will be used for Monitoring and Evaluation purposes. You can't undo this action afterwards.
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

export default DistrosReturnTrackingView;
