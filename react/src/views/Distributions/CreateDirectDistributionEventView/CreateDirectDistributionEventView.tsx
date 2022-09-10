import { gql, useMutation, useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreateDistributionEventMutation,
  CreateDistributionEventMutationVariables,
  DistroSpotsForBaseIdQuery,
  DistroSpotsForBaseIdQueryVariables,
} from "types/generated/graphql";
import CreateDirectDistroEvent, {
  CreateDistroEventFormData,
} from "./components/CreateDirectDistributionEvent";
import { addHours } from "date-fns";
import { getISODateTimeFromDateAndTime } from "utils/helpers";
import { Center } from "@chakra-ui/react";
import { DISTRO_SPOTS_FOR_BASE_ID } from "../queries";
import { useGlobalSiteState } from "utils/hooks";

const CreateDirectDistributionEventView = () => {
  const { currentBaseId } = useGlobalSiteState();

  const CREATE_DISTRIBUTION_EVENT_MUTATION = gql`
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
  `;

  const navigate = useNavigate();

  const [createDistributionEventMutation] = useMutation<
    CreateDistributionEventMutation,
    CreateDistributionEventMutationVariables
  >(CREATE_DISTRIBUTION_EVENT_MUTATION);

  const onSubmitNewDistroEvent = useCallback(
    (createDistroEventFormData: CreateDistroEventFormData) => {
      const plannedStartDateTime = getISODateTimeFromDateAndTime(
        createDistroEventFormData.eventDate,
        createDistroEventFormData.eventTime
      );
      const plannedEndDateTime = addHours(
        plannedStartDateTime,
        createDistroEventFormData.duration
      );

      createDistributionEventMutation({
        variables: {
          distributionSpotId: parseInt(createDistroEventFormData.distroSpotId),
          // TODO: probably better to make name optional/nullable also in the API
          // After that, let's remove the ` || ""`
          name: createDistroEventFormData.name || "",
          plannedStartDateTime: plannedStartDateTime.toISOString(),
          plannedEndDateTime: plannedEndDateTime.toISOString(),
        },
      })
        .then((mutationResult) => {
          if ((mutationResult.errors?.length || 0) > 0) {
            // TODO: Improve Error handling
            throw new Error(JSON.stringify(mutationResult.errors));
          }
          navigate(
            `/bases/${currentBaseId}/distributions/spots/${createDistroEventFormData.distroSpotId}/events/${mutationResult.data?.createDistributionEvent?.id}`
          );
        })
        .catch((error) => {
          console.error(
            "Error while trying to create Distribution Event",
            error
          );
        });
    },
    [createDistributionEventMutation, currentBaseId, navigate]
  );

  const { loading, error, data } = useQuery<
    DistroSpotsForBaseIdQuery,
    DistroSpotsForBaseIdQueryVariables
  >(DISTRO_SPOTS_FOR_BASE_ID, {
    variables: {
      baseId: currentBaseId,
    },
  });

  if (loading) {
    return <APILoadingIndicator />;
  }
  if (error) {
    console.error("Error in CreateDistributionEventView: ", error);
    return <div>Error!</div>;
  }
  if (data?.base?.distributionSpots == null) {
    console.error(
      "Error - Incomplete data in the database for this Distriubtion Spot",
      data
    );
    return (
      <div>
        Error - Incomplete data in the database for this Distriubtion Spot
      </div>
    );
  }
  const allDistroSpots = data?.base?.distributionSpots.map((spot) => ({
    ...spot,
    name: spot.name ?? "",
  }));

  return (
    <Center>
      <CreateDirectDistroEvent
        allDistroSpots={allDistroSpots}
        onSubmitNewDistroEvent={onSubmitNewDistroEvent}
      />
    </Center>
  );
};

export default CreateDirectDistributionEventView;
