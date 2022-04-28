import { gql, useQuery } from "@apollo/client";
import {
  Box,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import {
  BoxByLabelIdentifierQuery,
  BoxByLabelIdentifierQueryVariables,
} from "types/generated/graphql";

export const BOX_BY_LABEL_IDENTIFIER_QUERY = gql`
  query BoxByLabelIdentifier($labelIdentifier: String!) {
    box(labelIdentifier: $labelIdentifier) {
      labelIdentifier
      size
      items
      product {
        name
        gender
      }
      location {
        name
      }
    }
  }
`;

const BTBox = () => {
  const labelIdentifier =
    useParams<{ labelIdentifier: string }>().labelIdentifier!;
  const { loading, error, data } = useQuery<
    BoxByLabelIdentifierQuery,
    BoxByLabelIdentifierQueryVariables
  >(BOX_BY_LABEL_IDENTIFIER_QUERY, {
    variables: {
      labelIdentifier,
    },
  });
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }

  return (
    <Box>
      <Text
        fontSize={{ base: "16px", lg: "18px" }}
        // color={useColorModeValue('yellow.500', 'yellow.300')}
        fontWeight={"500"}
        textTransform={"uppercase"}
        mb={"4"}
      >
        Box Details
      </Text>

      <List spacing={2}>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Box Label:
          </Text>{" "}
          {data?.box?.labelIdentifier}
        </ListItem>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Product:
          </Text>{" "}
          {data?.box?.product?.name}
        </ListItem>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Gender:
          </Text>{" "}
          {data?.box?.product?.gender}
        </ListItem>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Size:
          </Text>{" "}
          {data?.box?.size}
        </ListItem>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Items:
          </Text>{" "}
          {data?.box?.items}
        </ListItem>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Location:
          </Text>{" "}
          {data?.box?.location?.name}
        </ListItem>
      </List>
    </Box>
  );
};

export default BTBox;
