import { EditIcon } from "@chakra-ui/icons";
import {
  Box,
  List,
  ListItem,
  Heading,
  Button,
  Text,
  Flex,
  IconButton,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
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

const BoxDetails = ({
  boxData,
  onMoveToLocationClick: moveToLocationClick,
}: BoxDetailsProps) => {
  // const allLocations = boxData?.place?.base?.locations
  // const [preferedLocations, setPreferedLocations] = useState(allLocations);

  // const setPreferedOrder = (locationId: string) => {
  //   const newPreferedLocations = [preferedLocations].unshift(...locationId);

  if (boxData == null) {
    console.error("BoxDetails Component: boxData is null");
    return <Box>No data found for a box with this id</Box>;
  }

  return (
    <Box>
      <Box border="2px" mb={2} backgroundColor="#F4E5A0">
        <Flex pt={2} px={4} direction="row" justifyContent="space-between">
          <Heading fontWeight={"bold"} mb={4} as="h2">
            Box {boxData.labelIdentifier}
          </Heading>
          <NavLink to="edit">
            <IconButton
              aria-label="Edit box"
              backgroundColor="transparent"
              icon={<EditIcon h={6} w={6} />}
            />
          </NavLink>
        </Flex>
        <List px={4} pb={2} spacing={2}>
          <ListItem>
            <Text fontSize="xl" fontWeight={"bold"}>
              {boxData.items} x {boxData.product?.name}
            </Text>
          </ListItem>
          <ListItem>
            <Flex direction="row">
              <Text mr={2}>{boxData.product?.gender}</Text>
              <Text>{boxData.size.label}</Text>
            </Flex>
          </ListItem>
        </List>
      </Box>
      <Box>
        <Text textAlign="center" fontSize="xl" my={4}>
          Move this box from <strong>{boxData.place?.name}</strong> to:
        </Text>
        <List>
          <Wrap>
            {boxData.place?.base?.locations
              ?.filter((location) => {
                return location.id !== boxData.place?.id;
              })
              .map((location, i) => (
                <WrapItem key={location.id}>
                  <Button
                    borderRadius="0px"
                    onClick={() => moveToLocationClick(location.id)}
                    disabled={boxData.place?.id === location.id}
                  >
                    {location.name}
                  </Button>
                </WrapItem>
              ))}
          </Wrap>
        </List>
      </Box>
    </Box>
  );
};

export default BoxDetails;
