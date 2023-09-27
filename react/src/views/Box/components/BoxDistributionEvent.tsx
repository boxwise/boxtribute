import { List, ListItem, Flex, LinkBox, LinkOverlay, Button, Box, Text } from "@chakra-ui/react";
import { useGetUrlForResourceHelpers } from "hooks/hooks";
import { distroEventStateHumanReadableLabels } from "views/Distributions/baseData";
import DistributionEventTimeRangeDisplay from "views/Distributions/components/DistributionEventTimeRangeDisplay";

export interface IDistributionEventProps {
  boxData: any;
  onAssignBoxToDistributionEventClick: (distributionEventId: string) => void;
  onUnassignBoxFromDistributionEventClick: (distributionEventId: string) => void;
}

function BoxDistributionEvent({
  boxData,
  onAssignBoxToDistributionEventClick,
  onUnassignBoxFromDistributionEventClick,
}: IDistributionEventProps) {
  const { getDistroEventDetailUrlById } = useGetUrlForResourceHelpers();

  return (
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
            const isAssignedToDistroEvent = boxData.distributionEvent?.id === distributionEvent.id;
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
                            plannedStartDateTime={new Date(distributionEvent.plannedStartDateTime)}
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
                          onClick={() => onAssignBoxToDistributionEventClick(distributionEvent.id)}
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
  );
}

export default BoxDistributionEvent;
