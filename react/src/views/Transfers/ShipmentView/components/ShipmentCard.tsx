import {
  Flex,
  List,
  ListItem,
  Spacer,
  StackDivider,
  VStack,
  Text,
  Box,
  Center,
} from "@chakra-ui/react";
import { ShipmentIcon } from "components/Icon/Transfer/ShipmentIcon";
import { SpecialNoteIcon } from "components/Icon/Transfer/SpecialNoteIcon";
import { Shipment } from "types/generated/graphql";

export interface IShipmentProps {
  shipment: Shipment;
}

function ShipmentCard({ shipment }: IShipmentProps) {
  return (
    <Box
      boxShadow="lg"
      p="6"
      padding={0}
      rounded="lg"
      bg="white"
      width={{ base: "240pt", md: "250pt", lg: "250pt" }}
      borderColor="blackAlpha.800"
      borderWidth={1.5}
    >
      <VStack
        p="6"
        padding={0}
        rounded="md"
        bg="white"
        divider={<StackDivider borderColor="blackAlpha.800" />}
        spacing={1}
        align="stretch"
      >
        <VStack spacing={2} padding={1} align="center">
          <Box fontWeight="extrabold">{shipment?.id}</Box>
          <Box fontWeight="xl">
            Status:
            {shipment?.state}
          </Box>
        </VStack>
        <Box border={0}>
          <Flex minWidth="max-content" alignItems="center" gap="2">
            <Spacer />
            <Box p="4">
              <List spacing={1}>
                <ListItem>
                  <Flex alignContent="center">
                    <Text fontSize="md" fontWeight="bold">
                      {shipment?.sourceBase?.name}
                    </Text>
                  </Flex>
                </ListItem>
                <ListItem>
                  <Flex alignContent="center">
                    <Text fontSize="md">{shipment?.sourceBase?.organisation.name}</Text>
                  </Flex>
                </ListItem>
              </List>
            </Box>
            <Spacer />
            <Box>
              <Flex alignContent="center">
                <ShipmentIcon />
              </Flex>
            </Box>
            <Spacer />
            <Box p="4">
              <List spacing={1}>
                <ListItem>
                  <Flex alignContent="center">
                    <Text fontSize="md" fontWeight="bold">
                      {shipment?.targetBase?.name}
                    </Text>
                  </Flex>
                </ListItem>
                <ListItem>
                  <Flex alignContent="center">
                    <Text fontSize="md">{shipment?.targetBase?.organisation.name}</Text>
                  </Flex>
                </ListItem>
              </List>
            </Box>
            <Spacer />
          </Flex>
          {typeof shipment.transferAgreement?.comment !== "undefined" && (
            <Center alignContent="stretch">
              <Spacer />
              <SpecialNoteIcon />
              <Text fontStyle="italic" p={2}>
                “{shipment.transferAgreement?.comment}”
              </Text>
              <Spacer />
            </Center>
          )}
        </Box>
        <StackDivider borderColor="blackAlpha.800" marginTop={-1.5} />
        <Box p={4}>
          <Center alignContent="stretch">
            <Text fontWeight="bold">TOTAL:</Text> {shipment.details?.length!} boxes
          </Center>
        </Box>
      </VStack>
    </Box>
  );
}

export default ShipmentCard;
