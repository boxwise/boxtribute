import {
  Accordion,
  AccordionItem,
  AccordionButton,
  Box,
  AccordionIcon,
  AccordionPanel,
  VStack,
  List,
  ListItem,
  Text,
  Button,
} from "@chakra-ui/react";
import _ from "lodash";
import React from "react";
import { DistributionEventState } from "types/generated/graphql";
import { distroEventStateHumanReadableLabels } from "views/Distributions/baseData";
import DistributionEventTimeRangeDisplay from "views/Distributions/components/DistributionEventTimeRangeDisplay";
import {
  DistributionSpotEnrichedData,
  DistroEventForSpot,
} from "views/Distributions/types";

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
      <Accordion w={[300, 420, 500]} allowToggle mb={4}>
        {distroSpots.map((distroSpot) => {
          return (
            <AccordionItem key={distroSpot.id}>
              <h2>
                <AccordionButton>
                  <VStack flex="1" textAlign="left">
                    <Box fontWeight="bold">{distroSpot.name}</Box>
                    {distroSpot.nextDistroEventDate ? (
                      <Box>
                        Next distribution on:
                        {distroSpot.nextDistroEventDate.toLocaleTimeString()}
                      </Box>
                    ) : null}
                  </VStack>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
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

                <Button
                  onClick={() =>
                    onCreateNewDistroEventForDistroSpotClick(distroSpot.id)
                  }
                >
                  Create New Event
                </Button>
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
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
  <ListItem
    key={distroEvent.id}
    border="1px"
    p={2}
    my={2}
    cursor="pointer"
    _hover={{
      color: "teal.500",
    }}
    onClick={() => onDistroEventClick(distroEvent.id)}
  >
    <Box as="time" dateTime={distroEvent.plannedStartDateTime.toUTCString()}>
      <DistributionEventTimeRangeDisplay
        plannedStartDateTime={new Date(distroEvent.plannedStartDateTime)}
        plannedEndDateTime={new Date(distroEvent.plannedEndDateTime)}
      />
    </Box>
    <Box>
      Status:
      {distroEventStateHumanReadableLabels.get(distroEvent.state)}
    </Box>
  </ListItem>
);

const DistroEventsAccordionForDistroSpotContainer = ({
  distroEvents,
  onDistroEventClick,
}: {
  distroEvents: DistroEventForSpot[];
  onDistroEventClick: (distroEventId: string) => void;
}) => {
  const completedEvents = distroEvents.filter(
    (distroEvent) => distroEvent.state === DistributionEventState.Completed
  );
  const nonCompletedEvents = distroEvents.filter(
    (distroEvent) => distroEvent.state !== DistributionEventState.Completed
  );

  return (
    <List>
      {nonCompletedEvents.map((distroEvent, i) => {
        return (
          <DistributionEventListItem
            distroEvent={distroEvent}
            onDistroEventClick={onDistroEventClick}
          />
        );
      })}
      {completedEvents.length > 0 && (
        <ListItem>
          <Accordion w={[250, 380, 450]} allowToggle mb={4}>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <VStack flex="1" textAlign="left">
                    <Box fontWeight="bold">Completed Events</Box>
                  </VStack>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                {completedEvents.map((distroEvent) => {
                  return (
                    <DistributionEventListItem
                      distroEvent={distroEvent}
                      onDistroEventClick={onDistroEventClick}
                    />
                  );
                })}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </ListItem>
      )}
    </List>
  );
};

export default DistroSpots;
