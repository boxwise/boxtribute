import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Link, useParams } from "react-router-dom";
import { Box, Heading, ListItem, UnorderedList } from "@chakra-ui/react";
import { LocationsForBaseQuery, LocationsForBaseQueryVariables } from "generated/graphql";


export const LOCATIONS_QUERY = gql`
  query LocationsForBase($baseId: ID!) {
    base(id: $baseId) {
      locations {
        id
        name
      }
    }
  }
`;

const LocationsListComponent = ({ baseId}: { baseId: string }) => {
  const { loading, error, data } = useQuery<LocationsForBaseQuery, LocationsForBaseQueryVariables>(
    LOCATIONS_QUERY,
    {
      variables: {
        baseId
      },
    },
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <UnorderedList data-testid="locations-list">
      {data?.base?.locations?.map((location, i) => (
        <ListItem key={i}>
          <Link to={`/bases/${baseId}/locations/${location.id}`}>{location.name}</Link>
        </ListItem>
      ))}
    </UnorderedList>
  );
};

const Locations = () => {
  const baseId = useParams<{ baseId: string }>().baseId;

  if(baseId == null) {
    return (<div>No valid base id</div>)
  }

  return (
    <Box>
      <Heading>Locations</Heading>
      <LocationsListComponent baseId={baseId} />
    </Box>
  );
};

export default Locations;
