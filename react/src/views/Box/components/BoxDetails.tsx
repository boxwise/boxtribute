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
  onScrap: () => void;
  onLost: () => void;
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
  onScrap,
  onLost,
}: BoxDetailsProps) => {
  const statusColor = (value) => {
    let color;
    if (value === "Lost" || value === "Scrap") {
      color = "#EB404A";
    } else {
      color = "#0CA789";
    }
    return color;
  };

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
        pb={2}
        backgroundColor="#F4E5A0"
        mr={["0", "0", "4rem", "4rem"]}
      >
        <Flex pt={2} px={4} direction="row" justifyContent="space-between">
          <Flex direction="column" mb={2}>
            <Heading fontWeight={"bold"} as="h2" data-testid="box-header">
              Box {boxData.labelIdentifier}
            </Heading>
            <Flex data-testid="box-subheader">
              <Text>
                <b>State:&nbsp;</b>
              </Text>
              <Text color={statusColor(boxData.state)}>
                <b>{boxData.state}</b>
              </Text>
            </Flex>
          </Flex>

          <NavLink to="edit">
            <IconButton
              aria-label="Edit box"
              borderRadius="0"
              icon={<EditIcon h={6} w={6} />}
              border="2px"
            />
          </NavLink>
        </Flex>
        <List px={4} pb={2} spacing={2}>
          <ListItem>
            <Text fontSize="xl" fontWeight={"bold"}>
              {boxData.product?.name}
            </Text>
          </ListItem>
          <ListItem>
            <Flex alignItems="center">
              <Box border="2px" borderRadius="0" px={2}>
                <Text fontSize="xl" fontWeight={"bold"} data-testid="boxview-number-items">
                  # {boxData.numberOfItems}
                </Text>
              </Box>
              <Box
                border="2px"
                backgroundColor="#1A202C"
                borderRadius="0"
                px={2}
              >
                <Text color="#F3E4A0" fontSize="xl" fontWeight={"bold"}>
                  {boxData.size.label}
                </Text>
              </Box>
            </Flex>
          </ListItem>
          <ListItem>
            <Flex direction="row" pb={4}>
              <Text fontSize="xl" fontWeight={"bold"}>
                <b>{boxData.product?.gender}</b>
              </Text>
            </Flex>
          </ListItem>
          <ListItem>
            {boxData.tags.length > 0 && <Flex direction="row">
              {boxData.tags.map((tag, i) => (
                <Text mr={2}>#{tag.name}</Text>
              ))}
            </Flex>}
          </ListItem>
          <ListItem>
            <Flex justifyContent="space-between">
              <Flex>
                <Button onClick={onScrap} mr={4} border="2px" borderRadius="0">
                  Scrap
                </Button>
                <Button onClick={onLost} mr={4} border="2px" borderRadius="0">
                  Lost
                </Button>
              </Flex>
              <Flex direction="row" justifyContent="flex-end">
                <IconButton
                  onClick={onPlusOpen}
                  mr={4}
                  border="2px"
                  borderRadius="0"
                  aria-label="Search database"
                  icon={<AddIcon />}
                  data-testid="increase-items"
                />
                <IconButton
                  onClick={onMinusOpen}
                  border="2px"
                  borderRadius="0"
                  aria-label="Search database"
                  icon={<MinusIcon />}
                  data-testid="decrease-items"
                />
              </Flex>
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
          Move this box from <strong>{boxData.location?.name}</strong> to:
        </Text>
        <List>
          <Flex wrap="wrap" justifyContent="center">
            {boxData.location?.base?.locations
              ?.filter((location) => {
                return location.id !== boxData.location?.id;
              })
              .map((location, i) => (
                <WrapItem key={location.id} m={1}>
                  <Button
                    borderRadius="0px"
                    onClick={() => onMoveToLocationClick(location.id)}
                    disabled={boxData.location?.id === location.id}
                    border="2px"
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
          {boxData.location?.base?.distributionEventsBeforeReturnedFromDistributionState
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
                          <Box>
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
              {boxData.location?.base?.distributionEvents
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
