import React from "react";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Box, Heading, ListItem, UnorderedList } from "@chakra-ui/react";
import { LocationQuery } from "../../types/generated/graphql"

const LOCATION_QUERY = gql`
query Location($locationId: ID!) {
  location(id: $locationId) {
    id
    name
    defaultBoxState
    boxes {
      totalCount
      elements {
        id
        product {
          name
          category {
            name
          }
          price
        }
        items
      }
    }
  }
}
`;

const BTLocation = () => {
  const locationId = useParams<{ locationId: string }>().locationId;
  const { loading, error, data } = useQuery<LocationQuery>(LOCATION_QUERY, {
    variables: {
      locationId,
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error || data == null) return <div>Error: {JSON.stringify(error)}</div>;
  if (data.location == null) return <Box>No location found</Box>;

  return (
    <Box>
      <Heading>
        Location '{data.location.name}' ({data.location.id})
      </Heading>
      <Box>
        <Heading as="h3">{data?.location?.boxes?.totalCount} Boxes in this location</Heading>
        <UnorderedList>
          {data?.location?.boxes?.elements.map((box) => (
            <ListItem>
              {box.id} - {box.product?.name}
            </ListItem>
          ))}
        </UnorderedList>
      </Box>
    </Box>
  );
};

export default BTLocation;
