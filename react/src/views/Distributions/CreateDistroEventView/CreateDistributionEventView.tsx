import { gql, useQuery } from "@apollo/client";
import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { DistributionSpotQuery } from "types/generated/graphql";
import CreateDistroEvent from "./components/CreateDistroEvent";

const CreateDistributionEventView = () => {
  const DISTRIBUTION_SPOT_QUERY = gql`
    query DistributionSpot($id: ID!) {
      distributionSpot(id: $id) {
        id
        name
      }
    }
  `;

  const onSubmitNewDistroEvent = useCallback(() => {
    console.log("onSubmitNewDistroEvent");
  }, []);


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

  const distributionSpotId =
    useParams<{ distributionSpotId: string }>().distributionSpotId!;

  const { data, loading, error } = useQuery<DistributionSpotQuery>(
    DISTRIBUTION_SPOT_QUERY,
    {
      variables: { id: distributionSpotId },
    }
  );

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error("Error in CreateDistributionEventView: ", error);
    return <div>Error!</div>;
  }
  if (data?.distributionSpot?.name == null) {
    console.error(
      "Error - Incomplete data in the database for this Distriubtion Spot"
    );
    console.log(data);
    return (
      <div>
        Error - Incomplete data in the database for this Distriubtion Spot
      </div>
    );
  }
  return (
    <CreateDistroEvent
      distroSpot={{name: data.distributionSpot.name || ""}}
      onSubmitNewDistroEvent={onSubmitNewDistroEvent}
    />
  );
};

export default CreateDistributionEventView;
