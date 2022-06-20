import {
  Accordion,
  AccordionItem,
  AccordionButton,
  Box,
  AccordionIcon,
  AccordionPanel,
  VStack,
} from "@chakra-ui/react";
import React from "react";

interface GeoData {
  lat: number;
  long: number;
}

export interface DistroSpot {
  id: string;
  name: string;
  geoData?: GeoData;
  nextDistroEventDate?: Date;
  comment?: string
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
                  <Box fontWeight="bold">
                    {distroSpot.name}
                  </Box>
                  <Box>
                    {distroSpot.nextDistroEventDate?.toDateString()}
                  </Box>
                </VStack>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default DistroSpots;
