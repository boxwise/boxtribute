import React from "react";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";

const LOCATION_QUERY = gql`
  query Location($locationId: ID!) {
    location(id: $locationId) {
      id
      name
    }
  }
`;

const BTLocation = () => {
  const locationId = useParams<{ locationId: string }>().locationId;
  const { loading, error, data } = useQuery(LOCATION_QUERY, {
    variables: {
      locationId,
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {JSON.stringify(error)}</div>;

  return (
    <div>
      <h2>Location</h2>
      {data?.location && <>Location name: {data.location.name}</>}
    </div>
  );
};

export default BTLocation;
