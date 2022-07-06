import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Box } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import {
  DistributionEventQuery,
  DistributionEventQueryVariables,
  DistributionEventState,
} from "types/generated/graphql";
import * as yup from "yup";
import DistroEventContainer, {
  DistributionEventDetails,
  distributionEventDetailsSchema,
} from "./components/DistroEventContainer";
import APILoadingIndicator from "components/APILoadingIndicator";

// const distributionSpotSchema = yup.object({
//   id: yup.string().required(),
//   name: yup.string().required(),
// });
// const distributionEventDetailsSchema = yup.object({
//   id: yup.string().required(),
//   name: yup.string().required(),
//   startDate: yup.date().required(),
//   state: yup
//     .mixed<DistributionEventState>()
//     .oneOf(Object.values(DistributionEventState))
//     .required(),
//   distributionSpot: distributionSpotSchema,
// });

const graphqlToContainerTransformer = (
  distributionEventData: DistributionEventQuery | undefined
): DistributionEventDetails => {
  // distributionEventDetailsSchema.validateSync(distributionEventData?.distributionEvent);
  // distributionEventDetailsSchema

  if(distributionEventData?.distributionEvent?.distributionSpot == null) {
    throw new Error("distributionEventData.distributionEvent.distributionSpot is null");
  }

  return {
    id: distributionEventData?.distributionEvent?.id,
    name: distributionEventData?.distributionEvent?.name || "",
    plannedStartDateTime: new Date(distributionEventData?.distributionEvent?.plannedStartDateTime),
    state: distributionEventData?.distributionEvent?.state,
    distributionSpot: {
      name: distributionEventData?.distributionEvent?.name || "",
      id: distributionEventData?.distributionEvent?.distributionSpot?.id,
    },
  };
};

const DistroEventView = () => {
  const eventId = useParams<{ eventId: string }>().eventId;

  const DISTRIBUTION_EVENT_QUERY = gql`
    query DistributionEvent($eventId: ID!) {
      distributionEvent(id: $eventId) {
        id
        name
        state
        plannedStartDateTime
        distributionSpot {
          id
          name
        }
      }
    }
  `;

  const { data, error, loading } = useQuery<
    DistributionEventQuery,
    DistributionEventQueryVariables
  >(DISTRIBUTION_EVENT_QUERY, {
    variables: {
      eventId: eventId!,
    },
  });

  if (loading) {
    return <APILoadingIndicator />;
  }

  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }

  console.log("FOO plannedStartDateTime", data?.distributionEvent?.plannedStartDateTime)
  console.log("FOO typeof(plannedStartDateTime)", typeof(data?.distributionEvent?.plannedStartDateTime))

  const transformedData = graphqlToContainerTransformer(data);

  console.log("FOO transformedData", typeof(transformedData.plannedStartDateTime))

    return <DistroEventContainer distroEventDetails={transformedData} />;
  // return <Box>{JSON.stringify(data)}</Box>;
};

export default DistroEventView;
