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
  Wrap,
  WrapItem,
  IconButton,
} from "@chakra-ui/react";
import { ShipmentIcon } from "components/Icon/Transfer/ShipmentIcon";
import { BiMinusCircle, BiPackage, BiPlusCircle } from "react-icons/bi";
import { RiFilePaperFill } from "react-icons/ri";
import { Shipment, ShipmentState } from "types/generated/graphql";

export interface IShipmentProps {
  shipment: Shipment;
  onRemove: () => void;
}

function ShipmentCard({ shipment, onRemove }: IShipmentProps) {
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
          <Wrap fontSize="xl" fontWeight="extrabold">
            <WrapItem>Shipment</WrapItem>
            <WrapItem>{shipment?.id}</WrapItem>
          </Wrap>
          <Box fontWeight="xl">
            <Wrap>
              <WrapItem>Status:</WrapItem>
              <WrapItem fontWeight="extrabold" color="blue.500">
                {shipment?.state?.toUpperCase()}
              </WrapItem>
            </Wrap>
          </Box>
        </VStack>
        <Box border={0}>
          <Flex minWidth="max-content" alignItems="center" gap="2">
            <Box p="4">
              <List spacing={1}>
                <ListItem>
                  <Flex alignContent="right">
                    <Text fontSize="xl" fontWeight="bold">
                      {shipment?.sourceBase?.name}
                    </Text>
                  </Flex>
                </ListItem>
                <ListItem>
                  <Flex alignContent="right">
                    <Text fontSize="md">{shipment?.sourceBase?.organisation.name}</Text>
                  </Flex>
                </ListItem>
              </List>
            </Box>
            <Spacer />
            <Box>
              <Flex alignContent="center">
                <ShipmentIcon boxSize={9} />
              </Flex>
            </Box>
            <Spacer />
            <Box p="4">
              <List spacing={1}>
                <ListItem>
                  <Flex alignContent="left">
                    <Text fontSize="xl" fontWeight="bold">
                      {shipment?.targetBase?.name}
                    </Text>
                  </Flex>
                </ListItem>
                <ListItem>
                  <Flex alignContent="left">
                    <Text fontSize="md">{shipment?.targetBase?.organisation.name}</Text>
                  </Flex>
                </ListItem>
              </List>
            </Box>
          </Flex>
          {typeof shipment.transferAgreement?.comment !== "undefined" && (
            <Flex alignContent="center" direction="row" marginBottom={-2}>
              <Spacer />
              <RiFilePaperFill />
              <Text fontStyle="italic" p={2}>
                “{shipment?.transferAgreement?.comment}”
              </Text>
              <Spacer />
            </Flex>
          )}
        </Box>
        <StackDivider borderColor="blackAlpha.800" marginTop={-1.5} />
        <Box p={4}>
          <Flex minWidth="max-content" alignItems="center" gap={2}>
            <Box bg="black" p={1} marginTop={-15}>
              <Text fontSize="xl" fontWeight="bold" color="white">
                TOTAL
              </Text>
            </Box>
            <Spacer />

            <Box>
              <Wrap spacing={2} align="center">
                <WrapItem>
                  <Center>
                    <Text fontSize="3xl" fontWeight="bold">
                      {shipment.details.length}
                    </Text>
                  </Center>
                </WrapItem>
                <WrapItem>
                  <Center>
                    <BiPackage size={35} />
                  </Center>
                </WrapItem>
              </Wrap>
            </Box>

            <Spacer />
            <Box>
              <VStack spacing={0} align="stretch">
                <IconButton
                  isRound
                  icon={<BiPlusCircle size={25} />}
                  isDisabled={shipment.state !== ShipmentState.Preparing}
                  onClick={() => {}}
                  aria-label="remove box"
                  style={{ background: "white" }}
                />

                <IconButton
                  isRound
                  icon={<BiMinusCircle size={25} />}
                  isDisabled={shipment.details.length === 0}
                  onClick={onRemove}
                  aria-label="remove box"
                  style={{ background: "white" }}
                />
              </VStack>
            </Box>
          </Flex>
        </Box>
      </VStack>
    </Box>
  );
}

export default ShipmentCard;
