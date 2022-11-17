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
  HStack,
  Tag,
  TagLabel,
  Spacer,
  Tooltip,
  Divider,
  Stack,
  ButtonGroup,
  Switch,
  FormLabel,
} from "@chakra-ui/react";
import { Style } from "victory";
import { NavLink } from "react-router-dom";
import {
  BoxByLabelIdentifierQuery,
  BoxState,
  UpdateLocationOfBoxMutation,
} from "types/generated/graphql";
import { useGetUrlForResourceHelpers } from "utils/hooks";
import { distroEventStateHumanReadableLabels } from "views/Distributions/baseData";
import DistributionEventTimeRangeDisplay from "views/Distributions/components/DistributionEventTimeRangeDisplay";

interface IBoxDetailsProps {
  boxData: BoxByLabelIdentifierQuery["box"] | UpdateLocationOfBoxMutation["updateBox"];
  onMoveToLocationClick: (locationId: string) => void;
  onPlusOpen: () => void;
  onMinusOpen: () => void;
  onStateChange: (boxState: BoxState) => void;
  onAssignBoxToDistributionEventClick: (distributionEventId: string) => void;
  onUnassignBoxFromDistributionEventClick: (distributionEventId: string) => void;
}

function BoxDetails({
  boxData,
  onMoveToLocationClick,
  onAssignBoxToDistributionEventClick,
  onUnassignBoxFromDistributionEventClick,
  onPlusOpen,
  onMinusOpen,
  onStateChange,
}: IBoxDetailsProps) {
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
    // eslint-disable-next-line no-console
    console.error("BoxDetails Component: boxData is null");
    return <Box>No data found for a box with this id</Box>;
  }

  return (
    <Flex
      direction={["column", "column", "row"]}
      alignItems={["center", "center", "flex-start"]}
      w="100%"
      justifyContent="center"
      data-testid="box-sections"
    >
      <Box
        w={["100%", "80%", "30%", "30%"]}
        border="2px"
        mb={6}
        pb={2}
        backgroundColor="#F4E5A0"
        mr={["0", "0", "4rem", "4rem"]}
      >
        <Flex py={2} px={4} minWidth="max-content" alignItems="center">
          <Box>
            <Heading fontWeight="bold" as="h2" data-testid="box-header">
              Box {boxData.labelIdentifier}
            </Heading>
          </Box>
          <Spacer />
          <Box>
            <NavLink to="edit">
              <IconButton
                aria-label="Edit box"
                borderRadius="0"
                icon={<EditIcon h={6} w={6} />}
                border="2px"
              />
            </NavLink>
          </Box>
        </Flex>
        {boxData.tags !== undefined && (
          <Flex pb={2} px={4} direction="row">
            <HStack spacing={1} data-testid="box-tags">
              {boxData.tags?.map((tag) => (
                <Tag key={tag.id} bg={Style.toTransformString(tag.color)}>
                  <TagLabel>{tag.name}</TagLabel>
                </Tag>
              ))}
            </HStack>
          </Flex>
        )}

        <Flex data-testid="box-subheader" py={2} px={4} direction="row">
          <Text fontWeight="bold">State:&nbsp;</Text>
          <Text fontWeight="bold" data-testid="box-state" color={statusColor(boxData.state)}>
            {boxData.state}
          </Text>
        </Flex>

        <Divider />
        <Stack py={2} px={4}>
          <Flex>
            <Heading as="h3" fontSize="xl" data-testid="boxview-number-items">
              {boxData.numberOfItems}x {boxData.product?.name}
            </Heading>
            <Spacer />
            <ButtonGroup gap="1">
              <Box alignContent="flex-end" marginLeft={2}>
                <Tooltip
                  hasArrow
                  shouldWrapChildren
                  mt="3"
                  label="add items"
                  aria-label="A tooltip"
                >
                  <IconButton
                    onClick={onPlusOpen}
                    size="sm"
                    border="2px"
                    isRound
                    borderRadius="0"
                    aria-label="Search database"
                    icon={<AddIcon />}
                    data-testid="increase-items"
                  />
                </Tooltip>
              </Box>
              <Box alignContent="flex-end" marginRight={1}>
                <Tooltip
                  hasArrow
                  label="remove items"
                  shouldWrapChildren
                  mt="3"
                  aria-label="A tooltip"
                >
                  <IconButton
                    onClick={onMinusOpen}
                    border="2px"
                    size="sm"
                    borderRadius="0"
                    isRound
                    aria-label="Search database"
                    icon={<MinusIcon />}
                    data-testid="decrease-items"
                  />
                </Tooltip>
              </Box>
            </ButtonGroup>
          </Flex>
        </Stack>

        <Spacer />
        <Flex py={2} px={4} direction="row">
          <List spacing={1}>
            <ListItem>
              <Flex alignContent="center">
                <Text fontWeight="bold">Size: {boxData.size.label}</Text>
              </Flex>
            </ListItem>
            {boxData.product?.gender !== "none" && (
              <ListItem>
                <Flex direction="row">
                  <Text fontWeight="bold">
                    Gender: <b>{boxData.product?.gender}</b>
                  </Text>
                </Flex>
              </ListItem>
            )}
            {boxData?.comment !== "" && boxData?.comment !== null && (
              <ListItem>
                <Flex direction="row">
                  <Text fontWeight="bold">
                    Comment: <b>{boxData?.comment}</b>
                  </Text>
                </Flex>
              </ListItem>
            )}
          </List>
        </Flex>

        <Divider />
        <Stack py={2} px={4} alignContent="center">
          <Flex alignContent="center" direction="row">
            <Text fontSize="xl" fontWeight="bold">
              Mark as: &nbsp;
            </Text>
          </Flex>
          <Flex py={2} px={2} minWidth="max-content" alignItems="center">
            <Flex alignContent="center" direction="row">
              <FormLabel htmlFor="scrap">Scrap:</FormLabel>
              <Switch
                id="scrap"
                isChecked={boxData.state === BoxState.Scrap}
                data-testid="box-scrap-btn"
                isFocusable={false}
                onChange={() =>
                  onStateChange(
                    // toggle the box state
                    boxData.state === BoxState.Scrap
                      ? (boxData?.location as any)?.defaultBoxState
                      : BoxState.Scrap,
                  )
                }
                mr={2}
              />
            </Flex>
            <Spacer />
            <Flex alignContent="center" direction="row">
              <FormLabel htmlFor="lost">Lost:</FormLabel>
              <Switch
                id="lost"
                isFocusable={false}
                data-testid="box-lost-btn"
                onChange={() =>
                  onStateChange(
                    // toggle the box state
                    boxData.state === BoxState.Lost
                      ? (boxData?.location as any)?.defaultBoxState
                      : BoxState.Lost,
                  )
                }
                mr={2}
                isChecked={boxData.state === BoxState.Lost}
              />
            </Flex>
          </Flex>
        </Stack>
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
        <Text data-testid="box-location-label" textAlign="center" fontSize="xl" mb={4}>
          Move this box from <strong>{boxData.location?.name}</strong> to:
        </Text>
        <List>
          <Flex wrap="wrap" justifyContent="center">
            {boxData.location?.base?.locations
              ?.filter((location) => location.id !== boxData.location?.id)
              .filter(
                (location) =>
                  location?.defaultBoxState !== BoxState.Lost &&
                  location?.defaultBoxState !== BoxState.Scrap,
              )
              .map((location) => (
                <WrapItem key={location.id} m={1}>
                  <Button
                    data-testid={`location-${location.name
                      ?.replace(/\s+/g, "_")
                      .toLowerCase()}-btn`}
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
      {boxData.distributionEvent && (
        <Box
          data-testid="distro-event-section"
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
                    backgroundColor={isAssignedToDistroEvent ? "gray.100" : "transparent"}
                    p={2}
                    border="2px"
                    borderColor="gray.300"
                  >
                    <Flex>
                      <LinkBox as="article" p={4}>
                        <Flex>
                          <LinkOverlay href={getDistroEventDetailUrlById(distributionEvent.id)}>
                            <Text>
                              <b>{distributionEvent?.distributionSpot?.name}</b>
                            </Text>
                            <Box>
                              <DistributionEventTimeRangeDisplay
                                plannedStartDateTime={
                                  new Date(distributionEvent.plannedStartDateTime)
                                }
                                plannedEndDateTime={new Date(distributionEvent.plannedEndDateTime)}
                              />
                            </Box>
                            <Text>{distributionEvent?.name}</Text>
                            <Text>
                              {distroEventStateHumanReadableLabels.get(distributionEvent?.state)}
                            </Text>
                          </LinkOverlay>
                        </Flex>
                        <Flex justifyContent="flex-end">
                          {isAssignedToDistroEvent ? (
                            <Button
                              mt={2}
                              onClick={() =>
                                onUnassignBoxFromDistributionEventClick(distributionEvent.id)
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
                                onAssignBoxToDistributionEventClick(distributionEvent.id)
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
      )}
    </Flex>
  );
}

export default BoxDetails;
