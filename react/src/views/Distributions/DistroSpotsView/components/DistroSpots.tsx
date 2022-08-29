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
import React from "react";
import { distroEventStateHumanReadableLabels } from "views/Distributions/baseData";
import DistributionEventTimeRangeDisplay from "views/Distributions/components/DistributionEventTimeRangeDisplay";
import { DistributionSpotEnrichedData } from "views/Distributions/types";

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

                <List>
                  {distroSpot.distroEvents.map((distroEvent, i) => {
                    return (
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
                        <Box
                          as="time"
                          dateTime={distroEvent.plannedStartDateTime.toUTCString()}
                        >
                          <DistributionEventTimeRangeDisplay
                            plannedStartDateTime={
                              new Date(distroEvent.plannedStartDateTime)
                            }
                            plannedEndDateTime={
                              new Date(distroEvent.plannedEndDateTime)
                            }
                          />
                        </Box>
                        <Box>
                          Status:
                          {distroEventStateHumanReadableLabels.get(
                            distroEvent.state
                          )}
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
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

export default DistroSpots;
