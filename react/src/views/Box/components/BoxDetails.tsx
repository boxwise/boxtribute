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
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
  Td,
  Center,
  Link,
} from "@chakra-ui/react";
import React from "react";
import { NavLink } from "react-router-dom";
import {
  BoxByLabelIdentifierQuery,
  UpdateLocationOfBoxMutation,
} from "types/generated/graphql";
import DistributionEventTimeRangeDisplay from "views/Distributions/components/DistributionEventTimeRangeDisplay";
import { DistributionEventDetailsSchema } from "views/Distributions/types";

interface BoxDetailsProps {
  boxData:
    | BoxByLabelIdentifierQuery["box"]
    | UpdateLocationOfBoxMutation["updateBox"];
  onMoveToLocationClick: (locationId: string) => void;
  onPlusOpen: () => void;
  onMinusOpen: () => void;
  // onAddItemsToBoxClick: (numberOfItems: number) => void;
  // onRemoveItemsFromBoxClick: (numberOfItems: number) => void;
}

const BoxDetails = ({
  boxData,
  onMoveToLocationClick: moveToLocationClick,
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
    <Box>
      {boxData.distributionEvent?.state === "Returned" && (
        <Box backgroundColor={"orange.100"} m={10} p={5}>
          ATTENTION: This box is still assigned to a
          <Link>Distribution Event</Link> which is currently in the "Returned"
          state. For ensuring data accuracy, it's strongly recommended that you
          finish the return tracking for the Distribution Event before you make
          changes to this box.
        </Box>
      )}
      <Flex
        direction={["column", "column", "row"]}
        alignItems={["center", "center", "flex-start"]}
        w="100%"
        justifyContent="center"
      >
        <Box
          w={["100%", "80%", "40%", "30%"]}
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
                <Text mr={2}>
                  <b>Gender: </b>
                  {boxData.product?.gender}
                </Text>
              </Flex>
            </ListItem>
            <ListItem>
              <Flex direction="row">
                <Text>
                  <b>Size: </b>
                  {boxData.size.label}
                </Text>
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

        <Box
          alignContent="center"
          w={["100%", "80%", "40%", "50%"]}
          border="2px"
          py={4}
          px={4}
        >
          <Text textAlign="center" fontSize="xl" mb={4}>
            Move this box from <strong>{boxData.place?.name}</strong> to:
          </Text>
          <List>
            <Flex wrap="wrap" justifyContent="center">
              {boxData.place?.base?.locations
                ?.filter((location) => {
                  return location.id !== boxData.place?.id;
                })
                .map((location, i) => (
                  <WrapItem key={location.id} m={1}>
                    <Button
                      borderRadius="0px"
                      onClick={() => moveToLocationClick(location.id)}
                      disabled={boxData.place?.id === location.id}
                    >
                      {location.name}
                    </Button>
                  </WrapItem>
                ))}
            </Flex>
          </List>
        </Box>
      </Flex>
      <Box
        alignContent="center"
        w={["100%", "80%", "40%", "50%"]}
        border="2px"
        py={4}
        px={4}
      >
        <Text textAlign="center" fontSize="xl" mb={4}>
          Assign this Box to Distribution Event:
        </Text>

        <List>
          {/* <Flex wrap="wrap" justifyContent="center"> */}
          {boxData.place?.base?.distributionEventsBeforeReturnState
            // .map(el => DistributionEventDetailsSchema.parse(el))
            .map((distributionEvent) => {
              return (
                <ListItem key={distributionEvent.id} m={5}>
                  <DistributionEventTimeRangeDisplay
                    plannedStartDateTime={
                      new Date(distributionEvent.plannedStartDateTime)
                    }
                    plannedEndDateTime={
                      new Date(distributionEvent.plannedEndDateTime)
                    }
                  />
                  <Text>{distributionEvent?.distributionSpot?.name}</Text>
                  <Text>{distributionEvent?.name}</Text>
                  <Text>
                    <Button
                      disabled={
                        boxData.distributionEvent?.id === distributionEvent.id
                      }
                    >
                      Assign
                    </Button>
                  </Text>
                </ListItem>
              );
            })}
          {/* </Flex> */}
        </List>

        {/* <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Distro Spot</Th>
                <Th>Event Name</Th>
                <Th>Assign/Unassign</Th>
              </Tr>
            </Thead>
            <Tbody>
              {boxData.place?.base?.distributionEvents
              // .map(el => DistributionEventDetailsSchema.parse(el))
              .map(
                (distributionEvent) => {
                  return (
                  <Tr key={distributionEvent.id}>
                    <Td>
                      <DistributionEventTimeRangeDisplay
                          plannedStartDateTime={
                            new Date(distributionEvent.plannedStartDateTime)
                          }
                          plannedEndDateTime={
                            new Date(distributionEvent.plannedEndDateTime)
                          }
                        />
                    </Td>
                    <Td>{distributionEvent?.distributionSpot?.name}</Td>
                    <Td>{distributionEvent?.name}</Td>
                    <Td>
                      <Button>Assign</Button>
                    </Td>
                  </Tr>
                )}
              )}
            </Tbody>
          </Table>
        </TableContainer> */}
      </Box>
    </Box>
  );
};

export default BoxDetails;
