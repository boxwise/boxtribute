import { Flex, Box, HStack, Text, VStack as Flex } from "@chakra-ui/react";
import { ProductGender } from "types/generated/graphql";
import { DistroEventState, DistroEventStateLabel } from "views/DistroSpotsView/components/DistroSpots";

export interface BTBox {
  id: string;
  labelIdentifier: string;
  items: number;
  size?: string;
  name: string;
  gender?: ProductGender;
}

export interface DistroEventData {
  eventDate?: Date;
  status: DistroEventState;
  id: string;
  outflows?: BTBox[];
  returns?: BTBox[];
}

interface DistroEventProps {
  distroEventData: DistroEventData;
}

const DistroEvent = ({ distroEventData: distroEventProps }: DistroEventProps) => {
  return (
      <>
      <Flex mb={2}>
          <Box>Distro Event</Box>
    
      <Box><strong>{distroEventProps.eventDate?.toDateString()}</strong></Box>
      <Box><strong>{DistroEventStateLabel.get(distroEventProps.status)}</strong></Box>
      
      </Flex>
      {distroEventProps.outflows?.map((box) => {
        return (
            <>
            <Text>Outflows:</Text>
          <Flex gap='2'>
            <Box>{box.labelIdentifier}</Box>
            <Box>{box.name}</Box>
            <Box>{box.items}</Box>
            
            <Box>{box.size}</Box>
            <Box>{box.gender}</Box>
          </Flex>
          </>
        );
      })}
      {distroEventProps.returns?.map((box) => {
        return (
            <>
            <Text>Returns</Text>
          <Flex>
            <Box>{box.labelIdentifier}</Box>
            <Box>{box.items}</Box>
            <Box>{box.name}</Box>
            <Box>{box.size}</Box>
            <Box>{box.gender}</Box>
          </Flex>
          </>
        );
      })}
    </>
  );
};

export default DistroEvent
