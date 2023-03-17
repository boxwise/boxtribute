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
  Heading,
  Stack,
} from "@chakra-ui/react";
import { ShipmentIcon } from "components/Icon/Transfer/ShipmentIcon";
import { BiMinusCircle, BiPackage, BiPlusCircle, BiTrash } from "react-icons/bi";
import { RiFilePaperFill } from "react-icons/ri";
import { TbMapOff } from "react-icons/tb";
import { Shipment, ShipmentState } from "types/generated/graphql";
import ShipmentColoredStatus from "./ShipmentColoredStatus";

export interface IShipmentProps {
  canCancelShipment: Boolean;
  canUpdateShipment: Boolean;
  canLooseShipment: Boolean;
  shipment: Shipment;
  onRemove: () => void;
  onCancel: (data: any) => void;
}

function ShipmentCard({
  canCancelShipment,
  canUpdateShipment,
  canLooseShipment,
  shipment,
  onRemove,
  onCancel,
}: IShipmentProps) {
  return (
    <Box
      boxShadow="lg"
      padding={0}
      rounded="lg"
      bg="white"
      width={{ base: "240pt", md: "250pt", lg: "250pt" }}
      borderColor="blackAlpha.800"
      borderWidth={1.5}
    >
      <VStack
        padding={0}
        rounded="md"
        bg="white"
        divider={<StackDivider borderColor="blackAlpha.800" />}
        spacing={1}
        align="stretch"
      >
        <Flex minWidth="max-content" justifyContent="flex-start" p={2}>
          <VStack>
            <Heading>
              <Wrap fontSize="2xl" fontWeight="extrabold">
                <WrapItem>Shipment</WrapItem>
                <WrapItem>{shipment?.id}</WrapItem>
              </Wrap>
            </Heading>
            <ShipmentColoredStatus state={shipment?.state} />
          </VStack>
          <Spacer />
          {canCancelShipment && (
            <IconButton
              isRound
              icon={<BiTrash size={30} />}
              isDisabled={shipment.state !== ShipmentState.Preparing}
              onClick={onCancel}
              style={{ background: "white" }}
              aria-label="cancel shipment"
            />
          )}
          {canLooseShipment && (
            <IconButton
              isRound
              icon={<TbMapOff size={30} />}
              variant="outline"
              style={{
                background: "white",
                color: ShipmentState.Lost === shipment.state ? "red" : "black",
              }}
              aria-label="cannot locate shipment"
            />
          )}
        </Flex>

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
          {shipment.transferAgreement?.comment && (
            <Stack direction="row" alignItems="center" bg="gray.100" marginBottom={-1}>
              <Spacer />
              <RiFilePaperFill size={30} />
              <Text fontStyle="italic" fontSize="sm" p={2}>
                “{shipment?.transferAgreement?.comment}”
              </Text>
              <Spacer />
            </Stack>
          )}
        </Box>
        <StackDivider borderColor="blackAlpha.800" marginTop={-1.5} />
        <Box p={2}>
          <Flex minWidth="max-content" alignItems="center" gap={2} p={0}>
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
                    <Text as="h3" fontSize="3xl" fontWeight="bold">
                      {shipment.details?.length || 0}
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
              {canUpdateShipment && (
                <VStack spacing={0} align="stretch">
                  <IconButton
                    isRound
                    height={8}
                    icon={<BiPlusCircle size={30} />}
                    isDisabled={shipment.state !== ShipmentState.Preparing}
                    onClick={() => {}}
                    aria-label="remove box"
                    style={{ background: "white" }}
                  />

                  <IconButton
                    isRound
                    height={8}
                    icon={<BiMinusCircle size={30} />}
                    isDisabled={shipment.details?.length === 0}
                    onClick={onRemove}
                    aria-label="remove box"
                    style={{ background: "white" }}
                  />
                </VStack>
              )}
            </Box>
          </Flex>
        </Box>
      </VStack>
    </Box>
  );
}

export default ShipmentCard;
