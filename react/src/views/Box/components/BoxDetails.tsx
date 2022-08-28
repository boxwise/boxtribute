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
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import {
  BoxByLabelIdentifierQuery,
  UpdateLocationOfBoxMutation,
} from "types/generated/graphql";
import { useGetUrlForResourceHelpers } from "utils/hooks";
import { distroEventStateHumanReadableLabels } from "views/Distributions/baseData";
import DistributionEventTimeRangeDisplay from "views/Distributions/components/DistributionEventTimeRangeDisplay";

interface BoxDetailsProps {
  boxData:
    | BoxByLabelIdentifierQuery["box"]
    | UpdateLocationOfBoxMutation["updateBox"];
  onMoveToLocationClick: (locationId: string) => void;
  onPlusOpen: () => void;
  onMinusOpen: () => void;
  onAssignBoxToDistributionEventClick: (distributionEventId: string) => void;
  onUnassignBoxFromDistributionEventClick: (
    distributionEventId: string
  ) => void;
}

const BoxDetails = ({
  boxData,
  onMoveToLocationClick,
  onAssignBoxToDistributionEventClick,
  onUnassignBoxFromDistributionEventClick,
  onPlusOpen,
  onMinusOpen,
}: BoxDetailsProps) => {
  // const allLocations = boxData?.place?.base?.locations
  // const [preferedLocations, setPreferedLocations] = useState(allLocations);

  // const setPreferedOrder = (locationId: string) => {
  //   const newPreferedLocations = [preferedLocations].unshift(...locationId);

  // const [openAddItemsModal, setOpenAddItemsModal] = useState(false);
  // const [openRemoveItemsModal, setOpenRemoveItemsModal] = useState(false);

  const { getDistroEventDetailUrlById } = useGetUrlForResourceHelpers();

  if (boxData == null) {
    console.error("BoxDetails Component: boxData is null");
    return <Box>No data found for a box with this id</Box>;
  }

  return (
    <Flex
      direction={["column", "column", "row"]}
      alignItems={["center", "center", "flex-start"]}
      w="100%"
      justifyContent="center"
    >
      <Box
        w={["100%", "80%", "30%", "30%"]}
        border="2px"
        mb={6}
        backgroundColor="#F4E5A0"
        mr={["0", "0", "4rem", "4rem"]}
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
              {boxData.numberOfItems} x {boxData.product?.name}
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
        w={["100%", "80%", "30%", "30%"]}
        border="2px"
        py={4}
        px={4}
        mr={["0", "0", "4rem", "4rem"]}
        mb={6}
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
                    onClick={() => onMoveToLocationClick(location.id)}
                    disabled={boxData.place?.id === location.id}
                  >
                    {location.name}
                  </Button>
                </WrapItem>
              ))}
          </Flex>
        </List>
      </Box>
      <Box
        alignContent="center"
        w={["100%", "80%", "30%", "30%"]}
        border="2px"
        py={4}
        px={4}
      >
        <Text textAlign="center" fontSize="xl" mb={4}>
          Assign this Box to Distribution Event:
        </Text>

        <List>
          {/* <Flex wrap="wrap" justifyContent="center"> */}
          {boxData.place?.base?.distributionEventsBeforeReturnedFromDistributionState
            // .map(el => DistributionEventDetailsSchema.parse(el))
            .map((distributionEvent) => {
              const isAssignedToDistroEvent =
                boxData.distributionEvent?.id === distributionEvent.id;
              return (
                <ListItem
                  key={distributionEvent.id}
                  m={4}
                  backgroundColor={
                    isAssignedToDistroEvent ? "gray.100" : "transparent"
                  }
                  p={2}
                  border="2px"
                  borderColor="gray.300"
                >
                  <Flex>
                    <LinkBox as="article" p={4}>
                      <Flex>
                        <LinkOverlay
                          href={getDistroEventDetailUrlById(
                            distributionEvent.id
                          )}
                        >
                          <Text>
                            <b>{distributionEvent?.distributionSpot?.name}</b>
                          </Text>
                          <Box
                            as="time"
                            dateTime={distributionEvent.plannedStartDateTime.toUTCString()}
                          >
                            <DistributionEventTimeRangeDisplay
                              plannedStartDateTime={
                                new Date(distributionEvent.plannedStartDateTime)
                              }
                              plannedEndDateTime={
                                new Date(distributionEvent.plannedEndDateTime)
                              }
                            />
                          </Box>
                          <Text>{distributionEvent?.name}</Text>
                          <Text>
                            {distroEventStateHumanReadableLabels.get(
                              distributionEvent?.state
                            )}
                          </Text>
                        </LinkOverlay>
                      </Flex>
                      <Flex justifyContent="flex-end">
                        {isAssignedToDistroEvent ? (
                          <Button
                            mt={2}
                            onClick={() =>
                              onUnassignBoxFromDistributionEventClick(
                                distributionEvent.id
                              )
                            }
                            colorScheme="red"
                            borderRadius="0"
                          >
                            Unassign
                          </Button>
                        ) : (
                          <Button
                            mt={2}
                            onClick={() =>
                              onAssignBoxToDistributionEventClick(
                                distributionEvent.id
                              )
                            }
                            colorScheme="blue"
                            borderRadius="0"
                          >
                            Assign
                          </Button>
                        )}
                      </Flex>
                    </LinkBox>
                  </Flex>
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
    </Flex>
  );
};

export default BoxDetails;
