import { Box, List, ListItem, Heading, Button, Text } from "@chakra-ui/react";
import React from "react";
import { BoxByLabelIdentifierQuery, UpdateLocationOfBoxMutation } from "types/generated/graphql";

interface BoxDetailsProps {
    boxData: BoxByLabelIdentifierQuery["box"] | UpdateLocationOfBoxMutation["updateBox"]
}

const BoxDetails = ({boxData}: BoxDetailsProps) => {
  
  return (<Box>
    <Text
      fontSize={{ base: "16px", lg: "18px" }}
      // color={useColorModeValue('yellow.500', 'yellow.300')}
      fontWeight={"500"}
      textTransform={"uppercase"}
      mb={"4"}
    >
      Box Details
    </Text>

    {/* <List spacing={2}>
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
    <Box>
      <Heading as={"h3"}>Move this box to location...</Heading>
      <List>
        {data?.box?.location?.base?.locations?.map((location, i) => (
          <ListItem key={location.id}>
            <Button
              onClick={() => moveToLocationClick(location.id)}
              disabled={data.box?.location?.id === location.id}
            >
              {location.name}
            </Button>
          </ListItem>
        ))}
      </List>
    </Box> */}
  </Box>)
};

export default BoxDetails;
