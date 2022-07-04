import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import APILoadingIndicator from "components/APILoadingIndicator";
import React, { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CreateDistributionEventMutation,
  CreateDistributionEventMutationVariables,
  DistributionSpotQuery,
} from "types/generated/graphql";
import CreateDistroEvent, {
  CreateDistroEventFormData,
} from "./components/CreateDistroEvent";

const CreateDistributionEventView = () => {
  const DISTRIBUTION_SPOT_QUERY = gql`
    query DistributionSpot($id: ID!) {
      distributionSpot(id: $id) {
        id
        name
      }
    }
  `;

  const CREATE_DISTRIBUTION_EVENT_MUTATION = gql`
    mutation CreateDistributionEvent(
      $distributionSpotId: Int!
      $name: String!
      $startDate: Date!
    ) {
      createDistributionEvent(
        creationInput: {
          distributionSpotId: $distributionSpotId
          name: $name
          startDate: $startDate
        }
      ) {
        id
        name
        startDate
      }
    }
  `;

  const { baseId, distributionSpotId } = useParams<{ baseId: string, distributionSpotId: string }>();
  const navigate = useNavigate();

  const [
    createDistributionEventMutation,
  ] = useMutation<
    CreateDistributionEventMutation,
    CreateDistributionEventMutationVariables
  >(CREATE_DISTRIBUTION_EVENT_MUTATION);

  const onSubmitNewDistroEvent = useCallback(
    (createDistroEventFormData: CreateDistroEventFormData) => {
      createDistributionEventMutation({
        variables: {
          distributionSpotId: parseInt(distributionSpotId!),
          // TODO: probably better to make name optional/nullable also in the API
          // After that, let's remove the ` || ""`
          name: createDistroEventFormData.name || "",
          startDate: createDistroEventFormData.eventDate,
        },
      })
        .then((mutationResult) => {
          if((mutationResult.errors?.length || 0) > 0) {
            // TODO: Improve Error handling
            throw new Error(JSON.stringify(mutationResult.errors));

          }
          navigate(
            `/bases/${baseId}/distributions/spots/${distributionSpotId}/events/${mutationResult.data?.createDistributionEvent?.id}`
          );
        })
        .catch((error) => {
          console.log("Error while trying to create Distribution Event", error);
        });
    },
    [baseId, createDistributionEventMutation, distributionSpotId, navigate]
  );

  // export const CREATE_DISTRIBUTION_EVENT_MUTATION = gql`
  // mutation CreateDistributionEvent($distributionSpotId: ID!, $distributionDate: Date!) {
  //   CreateDistributionEvent(
  //     updateInput: {
  //       labelIdentifier: $boxLabelIdentifier
  //       productId: $productId
  //     }
  //   ) {
  //     labelIdentifier
  //   }
  // }
  // `;

  const { data, loading, error } = useQuery<DistributionSpotQuery>(
    DISTRIBUTION_SPOT_QUERY,
    {
      variables: { id: distributionSpotId },
    }
  );

  if (loading) {
    return <APILoadingIndicator />;
  }
  if (error) {
    console.error("Error in CreateDistributionEventView: ", error);
    return <div>Error!</div>;
  }
  if (data?.distributionSpot?.name == null) {
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
  return (
    <CreateDistroEvent
      distroSpot={{ name: data.distributionSpot.name || "" }}
      onSubmitNewDistroEvent={onSubmitNewDistroEvent}
    />
  );
};

export default CreateDistributionEventView;
