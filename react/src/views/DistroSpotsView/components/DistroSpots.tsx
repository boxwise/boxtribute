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
  COMPLETED = 8
}

export const DistroEventStateLabel = new Map<number, string>([
  [DistroEventState.NEW, 'New'],
  [DistroEventState.PLANNING, 'Planning'],
  [DistroEventState.PLANNING_DONE, 'Planning Done'],
  [DistroEventState.PACKING, 'Packing'],
  [DistroEventState.PACKING_DONE, 'Packing Done'],
  [DistroEventState.ON_DISTRO, 'On Distribution'],
  [DistroEventState.RETURNED, 'Distribution Done'],
  [DistroEventState.RETURNS_TRACKED, 'Returned Items Tracked'],
  [DistroEventState.COMPLETED, 'Completed']
]);


export interface DistroEvents {
  eventDate?: Date;
  status: DistroEventState;
}

export interface DistroSpot {
  id: string;
  name: string;
  geoData?: GeoData;
  nextDistroEventDate?: Date;
  comment?: string;
  distroEvents: DistroEvents[];
}

interface DistroSpotsProps {
  distroSpots: DistroSpot[];
}

const DistroSpots = ({ distroSpots }: DistroSpotsProps) => {
  return (
    <Accordion allowToggle>
      {distroSpots.map((distroSpot) => {
        return (
          <AccordionItem>
            <h2>
              <AccordionButton>
                {/* <Box flex="1" textAlign="left"> */}
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
              <List>
                {distroSpot.distroEvents.map((distroEvent, i) => {
                  return (
                    <>
                      {distroSpot.comment ? (
                        <Box><strong>Comment:</strong> {distroSpot.comment}</Box>
                      ) : null}
                      <ListItem key={i}>
                        <Box>Date: {distroEvent.eventDate?.toDateString()}</Box>
                        <Box>Status: {DistroEventStateLabel.get(distroEvent.status)}</Box>
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
