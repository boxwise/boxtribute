import { useMutation, useQuery } from "@apollo/client/react";
import { graphql } from "../../../../../graphql/graphql";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreateDistroEvent, { CreateDistroEventFormData } from "./components/CreateDistributionEvent";
import { addHours } from "date-fns";
import { getISODateTimeFromDateAndTimeString } from "utils/helpers";
import { Center } from "@chakra-ui/react";

const CreateDistributionEventView = () => {
  const DISTRIBUTION_SPOT_QUERY = graphql(`
    query DistributionSpot($id: ID!) {
      distributionSpot(id: $id) {
        id
        name
      }
    }
  `);

  const CREATE_DISTRIBUTION_EVENT_MUTATION = graphql(`
    mutation CreateDistributionEvent(
      $distributionSpotId: Int!
      $name: String!
      $plannedStartDateTime: Datetime!
      $plannedEndDateTime: Datetime!
    ) {
      createDistributionEvent(
        creationInput: {
          distributionSpotId: $distributionSpotId
          name: $name
          plannedStartDateTime: $plannedStartDateTime
          plannedEndDateTime: $plannedEndDateTime
        }
      ) {
        id
        name
        plannedStartDateTime
        plannedEndDateTime
      }
    }
  `);

  const { baseId, distributionSpotId } = useParams<{
    baseId: string;
    distributionSpotId: string;
  }>();
  const navigate = useNavigate();

  const [createDistributionEventMutation] = useMutation(CREATE_DISTRIBUTION_EVENT_MUTATION);

  const onSubmitNewDistroEvent = useCallback(
    (createDistroEventFormData: CreateDistroEventFormData) => {
      const plannedStartDateTime = getISODateTimeFromDateAndTimeString(
        createDistroEventFormData.eventDate,
        createDistroEventFormData.eventTime,
      );
      const plannedEndDateTime = addHours(plannedStartDateTime, createDistroEventFormData.duration);

      createDistributionEventMutation({
        variables: {
          distributionSpotId: parseInt(distributionSpotId!),
          // TODO: probably better to make name optional/nullable also in the API
          // After that, let's remove the ` || ""`
          name: createDistroEventFormData.name || "",
          plannedStartDateTime: plannedStartDateTime.toISOString(),
          plannedEndDateTime: plannedEndDateTime.toISOString(),
        },
      })
        .then((mutationResult) => {
          if (mutationResult.error) {
            // TODO: Improve Error handling
            throw new Error(JSON.stringify(mutationResult.error));
          }
          navigate(
            `/bases/${baseId}/distributions/spots/${distributionSpotId}/events/${mutationResult.data?.createDistributionEvent?.id}`,
          );
        })
        .catch((error) => {
          console.error("Error while trying to create Distribution Event", error);
        });
    },
    [baseId, createDistributionEventMutation, distributionSpotId, navigate],
  );

  const { data, loading, error } = useQuery(DISTRIBUTION_SPOT_QUERY, {
    variables: { id: distributionSpotId || "0" },
  });

  if (loading) {
    return <APILoadingIndicator />;
  }
  if (error) {
    console.error("Error in CreateDistributionEventView: ", error);
    return <div>Error!</div>;
  }
  if (data?.distributionSpot?.name == null) {
    console.error("Error - Incomplete data in the database for this Distriubtion Spot", data);
    return <div>Error - Incomplete data in the database for this Distriubtion Spot</div>;
  }
  return (
    <Center>
      <CreateDistroEvent
        distroSpot={{ name: data.distributionSpot.name || "" }}
        onSubmitNewDistroEvent={onSubmitNewDistroEvent}
      />
    </Center>
  );
};

export default CreateDistributionEventView;
