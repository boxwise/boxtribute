import { gql, useQuery } from "@apollo/client";
import { Heading, ListItem, UnorderedList } from "@chakra-ui/react";
import React from "react";

const TMPQueryPlayground = () => {
  const { loading, error, data } = useQuery(gql`
    query {
      organisations {
        name
      }
      bases {
        name
      }
    }
  `);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <div>
      <Heading>Query Playground</Heading>
      {JSON.stringify(data)}
      <Heading as="h3">Organizations</Heading>
      <UnorderedList>
        {data.organisations.map((org) => (
          <ListItem>{org.name}</ListItem>
        ))}
      </UnorderedList>
    </div>
  );
};

export default TMPQueryPlayground;
