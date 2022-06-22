import {
  Flex,
  Box,
  HStack,
  Text,
  Grid,
  GridItem,
  SimpleGrid,
} from "@chakra-ui/react";
import { ProductGender } from "types/generated/graphql";
import {
  DistroEventState,
  DistroEventStateLabel,
} from "views/DistroSpotsView/components/DistroSpots";

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

const DistroEvent = ({ distroEventData }: DistroEventProps) => {
  return (
    <Box w={[null, 420, 500]}>
      <Flex direction="column" mb={2}>
        <Text fontSize="xl" mb={2}>
          Distro Event
        </Text>

        <Box>
          <strong>{distroEventData.eventDate?.toDateString()}</strong>
        </Box>
        <Box>
          <strong>{DistroEventStateLabel.get(distroEventData.status)}</strong>
        </Box>
      </Flex>
      {(distroEventData?.outflows?.length || 0) > 0 ? (
        <Text>Outflows:</Text>
      ) : null}
      {distroEventData.outflows?.map((box) => {
        return (
          <>

          {/* probably must be change to a react table */}
            <SimpleGrid minChildWidth="10px" columns={5} borderBottom="1px" my={2}>
              <Box>{box.labelIdentifier}</Box>
              <Box>{box.name}</Box>
              <Box>{box.items}</Box>

              <Box>{box.size}</Box>
              <Box>{box.gender}</Box>
            </SimpleGrid>
          </>
        );
      })}
      {(distroEventData?.returns?.length || 0) > 0 ? (
        <Text>Returns:</Text>
      ) : null}
      {distroEventData.returns?.map((box) => {
        return (
          <>
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
    </Box>
  );
};

export default DistroEvent;
