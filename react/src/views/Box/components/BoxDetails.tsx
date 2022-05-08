import { Box, List, ListItem, Heading, Button, Text } from "@chakra-ui/react";
import React from "react";
import {
  BoxByLabelIdentifierQuery,
  UpdateLocationOfBoxMutation,
} from "types/generated/graphql";

interface BoxDetailsProps {
  boxData:
    | BoxByLabelIdentifierQuery["box"]
    | UpdateLocationOfBoxMutation["updateBox"];
  onMoveToLocationClick: (locationId: string) => void;
}

const BoxDetails = ({ boxData, onMoveToLocationClick: moveToLocationClick }: BoxDetailsProps) => {
  if (boxData == null) {
    console.error("BoxDetails Component: boxData is null");
    return null;
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
          {boxData.labelIdentifier}
        </ListItem>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Product:
          </Text>{" "}
          {boxData.product?.name}
        </ListItem>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Gender:
          </Text>{" "}
          {boxData.product?.gender}
        </ListItem>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Size:
          </Text>{" "}
          {boxData.size}
        </ListItem>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Items:
          </Text>{" "}
          {boxData.items}
        </ListItem>
        <ListItem>
          <Text as={"span"} fontWeight={"bold"}>
            Location:
          </Text>{" "}
          {boxData.location?.name}
        </ListItem>
      </List>
      <Box>
        <Heading as={"h3"}>Move this box to location...</Heading>
        <List>
          {boxData.location?.base?.locations?.map((location, i) => (
            <ListItem key={location.id}>
              <Button
                onClick={() => moveToLocationClick(location.id)}
                disabled={boxData.location?.id === location.id}
              >
                {location.name}
              </Button>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default BoxDetails;
