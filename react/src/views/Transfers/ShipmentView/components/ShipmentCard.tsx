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
  Tooltip,
} from "@chakra-ui/react";
import { BoxIcon } from "components/Icon/Transfer/BoxIcon";
import { ShipmentIcon } from "components/Icon/Transfer/ShipmentIcon";
import { qrReaderOverlayVar } from "queries/cache";
import { BiMinusCircle, BiPlusCircle, BiTrash } from "react-icons/bi";
import { RiFilePaperFill } from "react-icons/ri";
import { TbMapOff } from "react-icons/tb";
import { Shipment, ShipmentState } from "types/generated/graphql";
import ShipmentColoredStatus from "./ShipmentColoredStatus";

export interface IShipmentProps {
  canCancelShipment: Boolean;
  canUpdateShipment: Boolean;
  canLooseShipment: Boolean;
  isLoadingMutation: boolean | undefined;
  shipment: Shipment;
  onRemove: () => void;
  onCancel: () => void;
  onLost: () => void;
}

function ShipmentCard({
  canCancelShipment,
  canUpdateShipment,
  canLooseShipment,
  isLoadingMutation,
  shipment,
  onRemove,
  onCancel,
  onLost,
}: IShipmentProps) {
  const totalLostBoxes = (
    shipment.details?.filter((item) => item.lostOn !== null && item.removedOn === null) ?? []
  ).length;

  return (
    <Box
      boxShadow="lg"
      padding={0}
      rounded="lg"
      bg="white"
      width={80}
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
        <Flex minWidth="max-content" justifyContent="flex-start" p={4}>
          <VStack alignItems="flex-start">
            <Heading>
              <Wrap fontSize={21} fontWeight="extrabold">
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
              isLoading={isLoadingMutation}
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
              isLoading={isLoadingMutation}
              onClick={onLost}
              style={{
                background: "white",
                color: ShipmentState.Lost === shipment.state ? "red" : "black",
              }}
              aria-label="cannot locate shipment"
            />
          )}
        </Flex>

        <Flex border={0} alignContent="center" justifyContent="center" py={2}>
          <Flex minWidth="max-content" alignItems="center" gap="4" alignContent="space-between">
            <Box>
              <List spacing={2}>
                <ListItem>
                  <Flex justifyContent="flex-end">
                    <Text fontSize="md" fontWeight="semibold" alignContent="right">
                      {shipment?.sourceBase?.name}
                    </Text>
                  </Flex>
                </ListItem>
                <ListItem>
                  <Flex justifyContent="flex-end">
                    <Text fontSize="md" alignContent="right">
                      {shipment?.sourceBase?.organisation.name}
                    </Text>
                  </Flex>
                </ListItem>
              </List>
            </Box>

            <Box>
              <Flex alignContent="center">
                <ShipmentIcon boxSize={9} />
              </Flex>
            </Box>

            <Box>
              <List spacing={2}>
                <ListItem>
                  <Flex justifyContent="flex-start">
                    <Text fontSize="md" fontWeight="semibold">
                      {shipment?.targetBase?.name}
                    </Text>
                  </Flex>
                </ListItem>
                <ListItem>
                  <Flex justifyContent="flex-start">
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
        </Flex>
        <StackDivider borderColor="blackAlpha.800" marginTop={-3} />
        <Box p={2}>
          <Flex minWidth="max-content" alignItems="center" p={0}>
            <Box bg="black" px={1} mt={-10}>
              <Text fontSize={16} fontWeight="semibold" color="white">
                TOTAL
              </Text>
            </Box>
            <Spacer />

            <Box>
              <Wrap spacing={2} align="center">
                <WrapItem>
                  <Center>
                    <Text as="h3" fontSize="3xl" fontWeight="bold">
                      {
                        (
                          shipment.details?.filter(
                            (item) =>
                              (item.lostOn === null &&
                                item.removedOn === null &&
                                shipment.state === ShipmentState.Completed) ||
                              (item.removedOn === null &&
                                shipment.state !== ShipmentState.Completed),
                          ) ?? []
                        ).length
                      }
                    </Text>
                  </Center>
                </WrapItem>
                <WrapItem>
                  <Center>
                    <BoxIcon boxSize={9} />
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
                    isLoading={isLoadingMutation}
                    onClick={() =>
                      qrReaderOverlayVar({
                        isOpen: true,
                        isMultiBox: true,
                        selectedShipmentId: shipment?.id,
                      })
                    }
                    aria-label="add box"
                    style={{ background: "white" }}
                  />

                  <IconButton
                    isRound
                    height={8}
                    icon={<BiMinusCircle size={30} />}
                    isDisabled={shipment.details?.length === 0}
                    onClick={onRemove}
                    isLoading={isLoadingMutation}
                    aria-label="remove box"
                    style={{ background: "white" }}
                  />
                </VStack>
              )}
              {shipment.state === ShipmentState.Completed && totalLostBoxes > 0 && (
                <VStack align="stretch" mr={1}>
                  <Tooltip label="the number of boxes that didn't arrive">
                    <Wrap spacing={0} align="center" style={{ color: "#909090" }}>
                      <WrapItem>
                        <Text as="p" fontSize={16} fontWeight="extrabold" color="red">
                          (
                        </Text>
                      </WrapItem>
                      <WrapItem>
                        <Center>
                          <Text as="p" fontSize={16} fontWeight="extrabold" color="red">
                            -
                            {
                              (
                                shipment.details?.filter(
                                  (item) => item.lostOn !== null && item.removedOn === null,
                                ) ?? []
                              ).length
                            }
                          </Text>
                        </Center>
                      </WrapItem>
                      <WrapItem>
                        <Center>
                          <BoxIcon boxSize={6} style={{ color: "red" }} />
                        </Center>
                      </WrapItem>
                      <WrapItem>
                        <Text as="p" fontSize={16} fontWeight="extrabold" color="red">
                          )
                        </Text>
                      </WrapItem>
                    </Wrap>
                  </Tooltip>
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
