import { Accordion, Box, VStack, List, Text, Button } from "@chakra-ui/react";
import { distroEventStateHumanReadableLabels } from "views/Distributions/baseData";
import DistributionEventTimeRangeDisplay from "views/Distributions/components/DistributionEventTimeRangeDisplay";
import { DistributionSpotEnrichedData, DistroEventForSpot } from "views/Distributions/types";

interface DistroSpotsProps {
  distroSpots: DistributionSpotEnrichedData[];
  onDistroEventClick: (distroEventId: string) => void;
  onCreateNewDistroSpotClick: () => void;
  onCreateNewDistroEventForDistroSpotClick: (distroSpotId: string) => void;
}

const DistroSpots = ({
  distroSpots,
  onDistroEventClick,
  onCreateNewDistroSpotClick,
  onCreateNewDistroEventForDistroSpotClick,
}: DistroSpotsProps) => {
  return (
    <VStack>
      <Accordion.Root w={[300, 420, 500]} collapsible mb={4}>
        {distroSpots.map((distroSpot) => {
          return (
            <Accordion.Item key={distroSpot.id} value={distroSpot.id}>
              <h2>
                <Accordion.ItemTrigger>
                  <VStack flex="1" textAlign="left">
                    <Box fontWeight="bold">{distroSpot.name}</Box>
                    {distroSpot.nextDistroEventDate ? (
                      <Box>
                        Next distribution on:
                        {distroSpot.nextDistroEventDate.toLocaleTimeString()}
                      </Box>
                    ) : null}
                  </VStack>
                  <Accordion.ItemIndicator />
                </Accordion.ItemTrigger>
              </h2>
              <Accordion.ItemContent pb={4}>
                {distroSpot.comment ? (
                  <Box my={2}>
                    <strong>Comment:</strong> {distroSpot.comment}
                  </Box>
                ) : null}
                {distroSpot.distroEvents?.length > 0 ? (
                  <Text>
                    <strong>Distibution Events: </strong>
                  </Text>
                ) : (
                  <Text>No Distribution Events</Text>
                )}

                <DistroEventsAccordionForDistroSpotContainer
                  distroEvents={distroSpot.distroEvents}
                  onDistroEventClick={onDistroEventClick}
                />

                <Button onClick={() => onCreateNewDistroEventForDistroSpotClick(distroSpot.id)}>
                  Create New Event
                </Button>
              </Accordion.ItemContent>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>
      <Button onClick={() => onCreateNewDistroSpotClick()}>Create New</Button>
    </VStack>
  );
};

const DistributionEventListItem = ({
  distroEvent,
  onDistroEventClick,
}: {
  distroEvent: DistroEventForSpot;
  onDistroEventClick: (distroEventId: string) => void;
}) => (
  <List.Item
    key={distroEvent.id}
    border="1px solid"
    p={2}
    my={2}
    cursor="pointer"
    _hover={{
      color: "teal.500",
    }}
    onClick={() => onDistroEventClick(distroEvent.id)}
  >
    <Box>
      <time dateTime={distroEvent.plannedStartDateTime.toUTCString()}>
        <DistributionEventTimeRangeDisplay
          plannedStartDateTime={new Date(distroEvent.plannedStartDateTime)}
          plannedEndDateTime={new Date(distroEvent.plannedEndDateTime)}
        />
      </time>
    </Box>
    <Box>
      Status:
      {distroEventStateHumanReadableLabels.get(distroEvent.state)}
    </Box>
  </List.Item>
);

const DistroEventsAccordionForDistroSpotContainer = ({
  distroEvents,
  onDistroEventClick,
}: {
  distroEvents: DistroEventForSpot[];
  onDistroEventClick: (distroEventId: string) => void;
}) => {
  const completedEvents = distroEvents.filter((distroEvent) => distroEvent.state === "Completed");
  const nonCompletedEvents = distroEvents.filter(
    (distroEvent) => distroEvent.state !== "Completed",
  );

  return (
    <List.Root>
      {nonCompletedEvents.map((distroEvent) => {
        return (
          <DistributionEventListItem
            distroEvent={distroEvent}
            onDistroEventClick={onDistroEventClick}
            key={distroEvent.id}
          />
        );
      })}
      {completedEvents.length > 0 && (
        <List.Item>
          <Accordion.Root w={[250, 380, 450]} collapsible mb={4}>
            <Accordion.Item value="completed">
              <h2>
                <Accordion.ItemTrigger>
                  <VStack flex="1" textAlign="left">
                    <Box fontWeight="bold">Completed Events</Box>
                  </VStack>
                  <Accordion.ItemIndicator />
                </Accordion.ItemTrigger>
              </h2>
              <Accordion.ItemContent pb={4}>
                {completedEvents.map((distroEvent) => {
                  return (
                    <DistributionEventListItem
                      distroEvent={distroEvent}
                      onDistroEventClick={onDistroEventClick}
                      key={distroEvent.id}
                    />
                  );
                })}
              </Accordion.ItemContent>
            </Accordion.Item>
          </Accordion.Root>
        </List.Item>
      )}
    </List.Root>
  );
};

export default DistroSpots;
