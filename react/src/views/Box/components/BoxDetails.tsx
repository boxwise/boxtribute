import { AddIcon, EditIcon, MinusIcon } from "@chakra-ui/icons";
import {
  Box,
  List,
  ListItem,
  Heading,
  Button,
  Text,
  Flex,
  IconButton,
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
  // onMoveToLocationClick: (locationId: string) => void;
  onPlusOpen: () => void;
  onMinusOpen: () => void;
  // onAddItemsToBoxClick: (numberOfItems: number) => void;
  // onRemoveItemsFromBoxClick: (numberOfItems: number) => void;
}

const BoxDetails = ({
  boxData,
  // onMoveToLocationClick: moveToLocationClick,
  onPlusOpen,
  onMinusOpen,
}: BoxDetailsProps) => {
  // const allLocations = boxData?.place?.base?.locations
  // const [preferedLocations, setPreferedLocations] = useState(allLocations);

  // const setPreferedOrder = (locationId: string) => {
  //   const newPreferedLocations = [preferedLocations].unshift(...locationId);

  // const [openAddItemsModal, setOpenAddItemsModal] = useState(false);
  // const [openRemoveItemsModal, setOpenRemoveItemsModal] = useState(false);

  if (boxData == null) {
    console.error("BoxDetails Component: boxData is null");
    return <Box>No data found for a box with this id</Box>;
  }

  return (
    <Flex direction={["column", "column", "row"]} alignItems={['center', 'center', 'flex-start']} w='100%' justifyContent='center' >
      <Box
        w={[
          "100%", // 0-30em
          "80%", // 30em-48em
          "40%", // 48em-62em
          "30%", // 62em-75em
          // 62em+
        ]}
        // mr={["0", "0", "2rem", "2rem"]}

        border="2px"
        mb={6}
        backgroundColor="#F4E5A0"
        mr={["0", "0", "6rem", "6rem"]}
      >
        <Flex pt={2} px={4} direction="row" justifyContent="space-between">
          <Heading fontWeight={"bold"} mb={4} as="h2">
            Box {boxData.labelIdentifier}
          </Heading>
          <NavLink to="edit">
            <IconButton
              aria-label="Edit box"
              backgroundColor="transparent"
              borderRadius="0"
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
          <ListItem>
            {/* <Flex direction="row">
              {boxData.tags.map((tag, i) => (
                <Text mr={2}>#{tag.name}</Text>
              ))}
            </Flex> */}
          </ListItem>
          <ListItem>
            <Flex direction="row" justifyContent="flex-end">
              <IconButton
                onClick={onPlusOpen}
                mr={4}
                border="2px"
                borderRadius="0"
                backgroundColor="transparent"
                aria-label="Search database"
                icon={<AddIcon />}
              />
              <IconButton
              onClick={onMinusOpen}
                border="2px"
                borderRadius="0"
                backgroundColor="transparent"
                aria-label="Search database"
                icon={<MinusIcon />}
              />
            </Flex>
          </ListItem>
        </List>
      </Box>
      <Box alignContent='center' w={[
          "100%", // 0-30em
          "80%", // 30em-48em
          "40%", // 48em-62em
          "50%", // 62em-75em
          // 62em+
        ]}
        // backgroundColor="#F4E5A0"
        border="2px"
        py={4}
        px={4}
        >
        <Text textAlign="center" fontSize="xl" mb={4}>
          Move this box from <strong>{boxData.location?.name}</strong> to:
        </Text>
        <List>
          <Flex wrap="wrap" gap='2' alignItems='center' justifyContent='center'>
            {boxData.location?.base?.locations
              ?.filter((location) => {
                return location.id !== boxData.location?.id;
              })
              .map((location, i) => (
                <WrapItem key={location.id}>
                  <Button
                    borderRadius="0px"
                    // onClick={() => moveToLocationClick(location.id)}
                    disabled={boxData.location?.id === location.id}
                  >
                    {location.name}
                  </Button>
                </WrapItem>
              ))}
          </Flex>
        </List>
      </Box>
    </Flex>
  );
};

export default BoxDetails;
