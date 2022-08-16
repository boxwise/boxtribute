import {
  Flex,
  Box,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { DistributionEventState, ProductGender } from "types/generated/graphql";
import { distroEventStateHumanReadableLabels } from "views/Distributions/baseData";

export interface BTBox {
  id: string;
  labelIdentifier?: string;
  numberOfItems: number;
  size?: string;
  name: string;
  gender?: ProductGender;
}

export interface DistroEventData {
  eventDate: Date;
  status: DistributionEventState;
  id: string;
  outflows?: BTBox[];
  returns?: BTBox[];
}

interface DistroEventProps {
  distroEventData: DistroEventData;
}

const DistroEventCompleted = ({ distroEventData }: DistroEventProps) => {
  return (
    <Box w={[null, 420, 500]}>
      <Flex direction="column" >
        <Text fontSize="xl" mb={2}>
          Distro Event
        </Text>

        <Box>
          <strong>{distroEventData.eventDate?.toDateString()}</strong>
        </Box>
        <Box>
          <strong>{distroEventStateHumanReadableLabels.get(distroEventData.status)}</strong>
        </Box>
      </Flex>
      {(distroEventData?.outflows?.length || 0) > 0 ? (
        <Text mt={8}><strong>Outflows:</strong></Text>
      ) : null}
      {distroEventData.outflows?.map((box) => {
        return (
          <>

          {/* probably must be change to a react table */}
            <SimpleGrid minChildWidth="10px" py={2} columns={5} borderBottom="1px" borderColor="gray.300" my={2}>
              <Box>{box.labelIdentifier}</Box>
              <Box>{box.name}</Box>
              <Box>{box.numberOfItems}</Box>

              <Box>{box.size}</Box>
              <Box>{box.gender}</Box>
            </SimpleGrid>
          </>
        );
      })}
      {(distroEventData?.returns?.length || 0) > 0 ? (
        <Text mt={8}><strong>Returns:</strong></Text>
      ) : null}
      {distroEventData.returns?.map((box) => {
        return (
          <>
            <SimpleGrid py={2} minChildWidth="10px" columns={5} borderBottom="1px" borderColor="gray.300" my={2}>
              <Box>{box.labelIdentifier}</Box>
              <Box>{box.name}</Box>
              <Box>{box.numberOfItems}</Box>
              <Box>{box.size}</Box>
              <Box>{box.gender}</Box>
            </SimpleGrid>
          </>
        );
      })}
    </Box>
  );
};

export default DistroEventCompleted;
