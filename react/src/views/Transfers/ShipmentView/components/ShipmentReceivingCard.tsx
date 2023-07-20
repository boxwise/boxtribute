import { Flex, Box, Spacer, Heading, Wrap, WrapItem, VStack, Center } from "@chakra-ui/react";
import { BoxIcon } from "components/Icon/Transfer/BoxIcon";
import { BoxState, Shipment } from "types/generated/graphql";

export interface IShipmentReceivingCardProps {
  shipment: Shipment;
}

function ShipmentReceivingCard({ shipment }: IShipmentReceivingCardProps) {
  return (
    <Box
      borderTopWidth="2px"
      borderBottomWidth="2px"
      borderTopColor="blackAlpha.500"
      borderBottomColor="blackAlpha.500"
      pt={1}
      pb={1}
    >
      <Flex alignItems="center">
        <Box p={2}>
          <VStack align="start">
            <Heading>
              <Wrap fontSize="xl" fontWeight="extrabold">
                <WrapItem>Shipment</WrapItem>
                <WrapItem>{shipment?.id}</WrapItem>
              </Wrap>
            </Heading>
            <Heading>
              <Wrap fontSize="md">
                <WrapItem color="gray.500">From:</WrapItem>
                <WrapItem fontWeight="semibold">{shipment?.sourceBase.name}</WrapItem>
                <WrapItem fontWeight="normal">{shipment?.sourceBase.organisation.name}</WrapItem>
              </Wrap>
            </Heading>
          </VStack>
        </Box>
        <Spacer />
        <Box borderColor="black" borderWidth="1px" minWidth="45%" maxH="min-content">
          <Box
            color="white"
            backgroundColor="black"
            mt={0}
            ml={0}
            p={1}
            width="fit-content"
            fontSize="sm"
            fontWeight="semibold"
          >
            REMAINING
          </Box>
          <Box pr={2}>
            <Flex alignItems="flex-end" justifyContent="flex-end">
              <Wrap>
                <WrapItem fontWeight="extrabold" fontSize="lg">
                  {
                    shipment.details.filter(
                      (b) => b.removedOn === null && b.box.state !== BoxState.InStock,
                    ).length
                  }{" "}
                  / {shipment.details.filter((b) => b.removedOn === null).length}
                </WrapItem>
                <WrapItem alignItems="center">
                  <Center>
                    <BoxIcon boxSize={6} />
                  </Center>
                </WrapItem>
              </Wrap>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}

export default ShipmentReceivingCard;
