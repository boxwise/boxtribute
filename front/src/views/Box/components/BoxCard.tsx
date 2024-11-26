import { EditIcon, AddIcon, MinusIcon } from "@chakra-ui/icons";
import {
  Box,
  Text,
  ButtonGroup,
  Divider,
  Flex,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  List,
  ListItem,
  Spacer,
  Stack,
  Switch,
  Tag,
  TagLabel,
  Tooltip,
  Wrap,
  WrapItem,
  SkeletonCircle,
  SkeletonText,
  Icon,
} from "@chakra-ui/react";
import { MdHistory } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { colorIsBright } from "utils/helpers";
import { Style } from "victory";
import HistoryEntries from "./HistoryEntries";
import { BoxByLabelIdentifier, UpdateBoxMutation } from "types/query-types";

export interface IBoxCardProps {
  boxData: BoxByLabelIdentifier | UpdateBoxMutation;
  boxInTransit: boolean;
  onHistoryOpen: () => void;
  onPlusOpen: () => void;
  onMinusOpen: () => void;
  onStateChange: (boxState: string) => void;
  isLoading: boolean;
}

function BoxCard({
  boxData,
  boxInTransit,
  onHistoryOpen,
  onPlusOpen,
  onMinusOpen,
  onStateChange,
  isLoading,
}: IBoxCardProps) {
  const statusColor = (value) => {
    let color;
    if (value === "Lost" || value === "Scrap" || value === "NotDelivered") {
      color = "#EB404A";
    } else {
      color = "#0CA789";
    }
    return color;
  };

  const hasTag = !!boxData?.tags?.length;

  const product =
    boxData?.state === "Receiving"
      ? boxData?.shipmentDetail?.shipment.details.filter(
          (b) => b.box.labelIdentifier === boxData.labelIdentifier,
        )[0].sourceProduct
      : boxData?.product;

  const numberOfItems =
    boxData?.state === "Receiving"
      ? boxData?.shipmentDetail?.shipment.details.filter(
          (b) => b.box.labelIdentifier === boxData.labelIdentifier,
        )[0].sourceQuantity
      : boxData?.numberOfItems;

  const size =
    boxData?.state === "Receiving"
      ? boxData?.shipmentDetail?.shipment.details.filter(
          (b) => b.box.labelIdentifier === boxData.labelIdentifier,
        )[0]?.sourceSize
      : boxData?.size;

  return (
    <Box border="2px" pb={2} backgroundColor="brandYellow.100" w="100%">
      <Wrap pt={2} pb={hasTag ? 2 : 0} px={4} alignItems="center">
        <WrapItem>
          <Heading fontWeight="bold" as="h2" data-testid="box-header">
            Box {boxData?.labelIdentifier}
          </Heading>
        </WrapItem>
        <Spacer />
        <WrapItem>
          <NavLink to="edit">
            <IconButton
              aria-label="Edit box"
              borderRadius="0"
              icon={<EditIcon h={6} w={6} />}
              border="2px"
              isDisabled={
                isLoading ||
                "Lost" === boxData?.state ||
                "Scrap" === boxData?.state ||
                "NotDelivered" === boxData?.state ||
                boxInTransit
              }
            />
          </NavLink>
        </WrapItem>
      </Wrap>
      {boxData?.tags !== undefined && (
        <Flex pb={2} px={4} direction="row">
          <HStack spacing={1} data-testid="box-tags">
            {boxData.tags?.map((tag) => (
              <Tag
                key={tag.id}
                bg={Style.toTransformString(tag.color)}
                color={colorIsBright(tag.color) ? "black" : "white"}
              >
                <TagLabel>{tag.name}</TagLabel>
              </Tag>
            ))}
          </HStack>
        </Flex>
      )}

      <Flex data-testid="box-subheader" pb={2} pt={hasTag ? 2 : 0} px={4} direction="row">
        <Text fontWeight="bold">Status:&nbsp;</Text>
        <Text fontWeight="bold" data-testid="box-state" color={statusColor(boxData?.state)}>
          {boxData?.state}
        </Text>
      </Flex>

      <Divider />
      <Stack py={2} px={4}>
        <Flex>
          <Heading as="h3" fontSize="xl" data-testid="boxview-number-items">
            {numberOfItems}x {product?.name}
          </Heading>

          <Spacer />
          <ButtonGroup gap="1">
            <Box alignContent="flex-end" marginLeft={2}>
              <Tooltip hasArrow shouldWrapChildren mt="3" label="add items" aria-label="A tooltip">
                <IconButton
                  onClick={onPlusOpen}
                  isDisabled={
                    "Lost" === boxData?.state ||
                    "Scrap" === boxData?.state ||
                    "NotDelivered" === boxData?.state ||
                    boxInTransit ||
                    isLoading
                  }
                  size="sm"
                  border="2px"
                  isRound
                  borderRadius="0"
                  aria-label="Search database"
                  icon={<AddIcon />}
                  data-testid="increase-items"
                />
              </Tooltip>
            </Box>
            <Box alignContent="flex-end" marginRight={1}>
              <Tooltip
                hasArrow
                label="remove items"
                shouldWrapChildren
                mt="3"
                aria-label="A tooltip"
              >
                <IconButton
                  onClick={onMinusOpen}
                  border="2px"
                  size="sm"
                  isDisabled={
                    "Lost" === boxData?.state ||
                    "Scrap" === boxData?.state ||
                    "NotDelivered" === boxData?.state ||
                    boxInTransit ||
                    isLoading
                  }
                  borderRadius="0"
                  isRound
                  aria-label="Search database"
                  icon={<MinusIcon />}
                  data-testid="decrease-items"
                />
              </Tooltip>
            </Box>
          </ButtonGroup>
        </Flex>
      </Stack>

      <Spacer />
      <Flex py={2} px={4} direction="row">
        <List spacing={1}>
          <ListItem>
            <Flex alignContent="center">
              <Text fontWeight="bold">Size: {size?.label}</Text>
            </Flex>
          </ListItem>
          {product?.gender !== "none" && (
            <ListItem>
              <Flex direction="row">
                <Text fontWeight="bold">
                  Gender: <b>{product?.gender}</b>
                </Text>
              </Flex>
            </ListItem>
          )}

          {boxData?.comment !== "" && boxData?.comment !== null && (
            <ListItem>
              <Flex direction="row">
                <Text>
                  <b>Comment: </b>
                  {boxData?.comment}
                </Text>
              </Flex>
            </ListItem>
          )}
        </List>
      </Flex>

      <Divider />
      <Stack py={2} px={4} alignContent="center">
        <Flex alignContent="center" direction="row">
          <Text fontSize="xl" fontWeight="bold">
            Mark as: &nbsp;
          </Text>
        </Flex>
        <Flex py={2} px={2} minWidth="max-content" alignItems="center">
          <Flex alignContent="center" direction="row">
            <FormLabel htmlFor="scrap">Scrap:</FormLabel>
            {isLoading && <SkeletonCircle height="20px" width="34px" />}
            {!isLoading && (
              <Switch
                id="scrap"
                isDisabled={
                  boxInTransit ||
                  boxData?.state === "NotDelivered" ||
                  (boxData?.location?.__typename === "ClassicLocation" &&
                    boxData?.location?.defaultBoxState === "Lost")
                }
                isReadOnly={isLoading}
                isChecked={boxData?.state === "Scrap"}
                data-testid="box-scrap-btn"
                isFocusable={false}
                onChange={() =>
                  onStateChange(
                    // If the current box state 'Scrap' is toggled, set the defaultBoxState of the box location
                    boxData?.state === "Scrap"
                      ? (boxData?.location as any)?.defaultBoxState
                      : "Scrap",
                  )
                }
                mr={2}
              />
            )}
          </Flex>
          <Spacer />
          <Flex alignContent="center" direction="row">
            <FormLabel htmlFor="lost">Lost:</FormLabel>
            {isLoading && <SkeletonCircle height="20px" width="34px" mr={2} />}
            {!isLoading && (
              <Switch
                id="lost"
                isFocusable={false}
                data-testid="box-lost-btn"
                isDisabled={
                  boxInTransit ||
                  boxData?.state === "NotDelivered" ||
                  (boxData?.location?.__typename === "ClassicLocation" &&
                    boxData?.location?.defaultBoxState === "Lost")
                }
                onChange={() =>
                  onStateChange(
                    // If the current box state 'Lost' is toggled, set the defaultBoxState of the box location
                    boxData?.state === "Lost"
                      ? (boxData?.location as any)?.defaultBoxState
                      : "Lost",
                  )
                }
                mr={2}
                isChecked={boxData?.state === "Lost"}
              />
            )}
          </Flex>
        </Flex>
      </Stack>

      {boxData?.history && boxData?.history?.length > 0 && (
        <>
          <Divider />
          <Stack py={2} px={4} alignContent="center">
            <Flex alignContent="center" direction="column">
              <Text fontSize="lg" fontWeight="bold">
                History: &nbsp;
              </Text>
              <Spacer />
              <Flex py={0} px={0} alignContent="space-between" verticalAlign="center">
                {!isLoading && <HistoryEntries data={boxData?.history} total={1} />}
                {isLoading && (
                  <SkeletonText noOfLines={3} width="100%" py={2} px={2} alignContent="center" />
                )}
                {boxData?.history && boxData?.history?.length > 1 && (
                  <>
                    <Spacer />
                    <IconButton
                      onClick={onHistoryOpen}
                      border="2px"
                      size="sm"
                      borderRadius="0"
                      isRound
                      aria-label="Show detail history"
                      icon={<Icon as={MdHistory} h={6} w={6} />}
                    />
                  </>
                )}
              </Flex>
            </Flex>
          </Stack>
        </>
      )}
    </Box>
  );
}

export default BoxCard;
