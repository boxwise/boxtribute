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
  Center,
} from "@chakra-ui/react";
import React from "react";

interface GeoData {
  lat: number;
  long: number;
}

export enum DistroEventState {
  NEW = 0,
  PLANNING = 1,
  PLANNING_DONE = 2,
  PACKING = 3,
  PACKING_DONE = 4,
  ON_DISTRO = 5,
  RETURNED = 6,
  RETURNS_TRACKED = 7,
  COMPLETED = 8,
}

export const DistroEventStateLabel = new Map<number, string>([
  [DistroEventState.NEW, "New"],
  [DistroEventState.PLANNING, "Planning"],
  [DistroEventState.PLANNING_DONE, "Planning Done"],
  [DistroEventState.PACKING, "Packing"],
  [DistroEventState.PACKING_DONE, "Packing Done"],
  [DistroEventState.ON_DISTRO, "On Distribution"],
  [DistroEventState.RETURNED, "Distribution Done"],
  [DistroEventState.RETURNS_TRACKED, "Returned Items Tracked"],
  [DistroEventState.COMPLETED, "Completed"],
]);

export interface DistroEvent {
  eventDate?: Date;
  status: DistroEventState;
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
    <Center>
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
                        <Box>Date: {distroEvent.eventDate?.toDateString()}</Box>
                        <Box>
                          Status:{" "}
                          {DistroEventStateLabel.get(distroEvent.status)}
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
    </Center>
  );
};

export default DistroSpots;
