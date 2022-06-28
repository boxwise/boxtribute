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

interface GeoData {
  latitude: number;
  longitude: number;
}

export enum DistributionEventState {
  Completed = "Completed",
  New = "New",
  OnDistro = "OnDistro",
  Packing = "Packing",
  PackingDone = "PackingDone",
  Planning = "Planning",
  PlanningDone = "PlanningDone",
  Returned = "Returned",
  ReturnsTracked = "ReturnsTracked",
}

export const DistroEventStateLabel = new Map<string, string>([
  [DistributionEventState.New, "New"],
  [DistributionEventState.Planning, "Planning"],
  [DistributionEventState.PlanningDone, "Planning Done"],
  [DistributionEventState.Packing, "Packing"],
  [DistributionEventState.PackingDone, "Packing Done"],
  [DistributionEventState.OnDistro, "On Distribution"],
  [DistributionEventState.Returned, "Distribution Done"],
  [DistributionEventState.ReturnsTracked, "Returned Items Tracked"],
  [DistributionEventState.Completed, "Completed"],
]);

export interface DistroEventForSpot {
  startDateTime?: Date;
  state: DistributionEventState;
  id: string;
}

export interface DistroSpot {
  id: string;
  name: string;
  geoData?: GeoData;
  nextDistroEventDate?: Date;
  comment?: string;
  distroEvents: DistroEventForSpot[];
}

interface DistroSpotsProps {
  distroSpots: DistroSpot[];
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
                        Next distribution on:{" "}
                        {distroSpot.nextDistroEventDate?.toDateString()}{" "}
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
                        <Box>Date: {distroEvent.startDateTime?.toDateString()}</Box>
                        <Box>
                          Status: {DistroEventStateLabel.get(distroEvent.state)}
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
                <Button onClick={() => onCreateNewDistroEventForDistroSpotClick(distroSpot.id)}>
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
