import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { Box, Heading, ListItem, UnorderedList } from "@chakra-ui/react";

interface Location {
  name: string;
  id: number;
  boxes: BTBox[];
}

interface Product {
  name;
  category: {
    name: string;
  };
}

interface BTBox {
  gender: string;
  items: number;
  product: Product;
}

interface LocationsData {
  locations: Location[];
}

const LOCATIONS_QUERY = gql`
  query {
    locations {
      id
      name
    }
  }
`;

const Locations = () => {
  const { loading, error, data } = useQuery<LocationsData>(LOCATIONS_QUERY);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Box>
      <Heading>Locations</Heading>
      <UnorderedList>
        {data?.locations?.map((location, i) => (
          <ListItem key={i}>
            <Link to={`/locations/${location.id}`}>{location.name}</Link>
          </ListItem>
        ))}
      </UnorderedList>
    </Box>
  );
};

export default Locations;
