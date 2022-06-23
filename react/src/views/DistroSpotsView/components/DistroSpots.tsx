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
} from "@chakra-ui/react";
import React from "react";

interface GeoData {
  latitude: number;
  longitude: number;
}

export enum DistributionEventState {
  Completed = 'COMPLETED',
  New = 'NEW',
  OnDistro = 'ON_DISTRO',
  Packing = 'PACKING',
  PackingDone = 'PACKING_DONE',
  Planning = 'PLANNING',
  PlanningDone = 'PLANNING_DONE',
  Returned = 'RETURNED',
  ReturnsTracked = 'RETURNS_TRACKED'
}

// export enum DistributionEventState {
//   NEW = 0,
//   PLANNING = 1,
//   PLANNING_DONE = 2,
//   PACKING = 3,
//   PACKING_DONE = 4,
//   ON_DISTRO = 5,
//   RETURNED = 6,
//   RETURNS_TRACKED = 7,
//   COMPLETED = 8,
// }

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

export interface DistroEvent {
  date?: Date;
  state: DistributionEventState;
  id: string;
}

export interface DistroSpot {
  id: string;
  name: string;
  geoData?: GeoData;
  nextDistroEventDate?: Date;
  comment?: string;
  distroEvents: DistroEvent[];
}

interface DistroSpotsProps {
  distroSpots: DistroSpot[];
  onDistroEventClick: (distroEventId: string) => void;
}

const DistroSpots = ({ distroSpots, onDistroEventClick }: DistroSpotsProps) => {
  return (
    <Accordion w={[300, 420, 500]} allowToggle>
      {distroSpots.map((distroSpot) => {
        return (
          <AccordionItem>
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
                    <>
                      <ListItem
                        border="1px"
                        p={2}
                        my={2}
                        key={i}
                        cursor="pointer"
                        _hover={{
                          color: "teal.500",
                        }}
                        onClick={() => onDistroEventClick(distroEvent.id)}
                      >
                        <Box>Date: {distroEvent.date?.toDateString()}</Box>
                        <Box>
                          Status:{" "}
                          {DistroEventStateLabel.get(distroEvent.state)}
                        </Box>
                      </ListItem>
                    </>
                  );
                })}
              </List>
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default DistroSpots;
