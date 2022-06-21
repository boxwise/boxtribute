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
  New,
  Planning,
  PlanningDone,
  Packing,
  PackingDone,
  OnDistro,
  Returned,
  ReturnsTracked,
  Completed,
}

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
                        <Box>Status: {distroEvent.status}</Box>
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
