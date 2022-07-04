import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Box } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import {
  DistributionEventQuery,
  DistributionEventQueryVariables,
} from "types/generated/graphql";

const DistroEventView = () => {
  const eventId = useParams<{ eventId: string }>().eventId;

  const DISTRIBUTION_EVENT_QUERY = gql`
    query DistributionEvent($eventId: ID!) {
      distributionEvent(id: $eventId) {
        name
        state
        startDate
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
    return <div>Loading...</div>;
  }

  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }

  return <Box>{JSON.stringify(data)}</Box>;
};

export default DistroEventView;
