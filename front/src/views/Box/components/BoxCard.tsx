import { IoPencil, IoAdd, IoRemove } from "react-icons/io5";
import {
  Box,
  Text,
  ButtonGroup,
  Separator,
  Flex,
  Field,
  Heading,
  HStack,
  IconButton,
  List,
  Spacer,
  Stack,
  Switch,
  Tag,
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
import { BoxByLabelIdentifier } from "queries/types";
import { RiQrCodeLine } from "react-icons/ri";

export interface IBoxCardProps {
  boxData: BoxByLabelIdentifier;
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
    boxData?.state === "Receiving" ? boxData?.shipmentDetail?.sourceProduct : boxData?.product;

  const numberOfItems =
    boxData?.state === "Receiving"
      ? boxData?.shipmentDetail?.sourceQuantity
      : boxData?.numberOfItems;

  const size = boxData?.state === "Receiving" ? boxData?.shipmentDetail?.sourceSize : boxData?.size;
  const printLabelUrl = `${import.meta.env.FRONT_OLD_APP_BASE_URL}/pdf/qr.php?label=${boxData?.id}`;

  return (
    <Box border="2px" pb={2} backgroundColor="brandYellow.100" w="100%">
      <Wrap pt={2} pb={hasTag ? 2 : 0} px={4} alignItems="center">
        <WrapItem>
          <Heading fontWeight="bold" as="h2" data-testid="box-header">
            Box {boxData?.labelIdentifier}
          </Heading>
        </WrapItem>
        {boxData?.qrCode && (
          <WrapItem pt={2}>
            <a href={printLabelUrl} target="_blank" rel="noopener noreferrer">
              <IconButton
                aria-label="Print label"
                borderRadius="5"
                size="sm"
                border="2px"
                disabled={isLoading}
              >
                <RiQrCodeLine size={24} />
              </IconButton>
            </a>
          </WrapItem>
        )}
        <Spacer />
        <WrapItem>
          <NavLink to="edit">
            <IconButton
              aria-label="Edit box"
              borderRadius="0"
              border="2px"
              disabled={
                isLoading ||
                "Lost" === boxData?.state ||
                "Scrap" === boxData?.state ||
                "NotDelivered" === boxData?.state ||
                boxInTransit ||
                !!boxData?.deletedOn
              }
            >
              <IoPencil size={24} />
            </IconButton>
          </NavLink>
        </WrapItem>
      </Wrap>
      {boxData?.tags !== undefined && (
        <Flex pb={2} px={4} direction="row">
          <HStack gap={1} data-testid="box-tags">
            {boxData.tags?.map((tag) => (
              <Tag.Root
                key={tag.id}
                bg={Style.toTransformString(tag.color)}
                color={colorIsBright(tag.color) ? "black" : "white"}
              >
                <Tag.Label>{tag.name}</Tag.Label>
              </Tag.Root>
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

      <Separator />
      <Stack py={2} px={4}>
        <Flex>
          <Heading as="h3" fontSize="xl" data-testid="boxview-number-items">
            {numberOfItems}x {product?.name}
          </Heading>

          <Spacer />
          <ButtonGroup gap="1">
            <Box alignContent="flex-end" marginLeft={2}>
              <Tooltip.Root openDelay={300}>
                <Tooltip.Trigger asChild>
                  <IconButton
                    onClick={onPlusOpen}
                    disabled={
                      "Lost" === boxData?.state ||
                      "Scrap" === boxData?.state ||
                      "NotDelivered" === boxData?.state ||
                      boxInTransit ||
                      isLoading ||
                      !!boxData?.deletedOn
                    }
                    size="sm"
                    border="2px"
                    borderRadius="full"
                    aria-label="Search database"
                    data-testid="increase-items"
                  >
                    <IoAdd />
                  </IconButton>
                </Tooltip.Trigger>
                <Tooltip.Positioner>
                  <Tooltip.Arrow />
                  <Tooltip.Content>add items</Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Root>
            </Box>
            <Box alignContent="flex-end" marginRight={1}>
              <Tooltip.Root openDelay={300}>
                <Tooltip.Trigger asChild>
                  <IconButton
                    onClick={onMinusOpen}
                    border="2px"
                    size="sm"
                    disabled={
                      "Lost" === boxData?.state ||
                      "Scrap" === boxData?.state ||
                      "NotDelivered" === boxData?.state ||
                      boxInTransit ||
                      isLoading ||
                      !!boxData?.deletedOn
                    }
                    borderRadius="full"
                    aria-label="Search database"
                    data-testid="decrease-items"
                  >
                    <IoRemove />
                  </IconButton>
                </Tooltip.Trigger>
                <Tooltip.Positioner>
                  <Tooltip.Arrow />
                  <Tooltip.Content>remove items</Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Root>
            </Box>
          </ButtonGroup>
        </Flex>
      </Stack>

      <Spacer />
      <Flex py={2} px={4} direction="row">
        <List.Root gap={1}>
          <List.Item>
            <Flex alignContent="center">
              <Text fontWeight="bold">Size: {size?.label}</Text>
            </Flex>
          </List.Item>
          {product?.gender !== "none" && (
            <List.Item>
              <Flex direction="row">
                <Text fontWeight="bold">
                  Gender: <b>{product?.gender}</b>
                </Text>
              </Flex>
            </List.Item>
          )}

          {boxData?.comment !== "" && boxData?.comment !== null && (
            <List.Item>
              <Flex direction="row">
                <Text>
                  <b>Comment: </b>
                  {boxData?.comment}
                </Text>
              </Flex>
            </List.Item>
          )}
        </List.Root>
      </Flex>

      <Separator />
      <Stack py={2} px={4} alignContent="center">
        <Flex alignContent="center" direction="row">
          <Text fontSize="xl" fontWeight="bold">
            Mark as: &nbsp;
          </Text>
        </Flex>
        <Flex py={2} px={2} minWidth="max-content" alignItems="center">
          <Flex alignContent="center" direction="row">
            <Field.Label htmlFor="scrap">Scrap:</Field.Label>
            {isLoading && <SkeletonCircle height="20px" width="34px" />}
            {!isLoading && (
              <Switch.Root
                id="scrap"
                disabled={
                  boxInTransit ||
                  boxData?.state === "NotDelivered" ||
                  (boxData?.location?.__typename === "ClassicLocation" &&
                    boxData?.location?.defaultBoxState === "Lost") ||
                  !!boxData?.deletedOn
                }
                readOnly={isLoading}
                checked={boxData?.state === "Scrap"}
                data-testid="box-scrap-btn"
                onCheckedChange={() =>
                  onStateChange(
                    // If the current box state 'Scrap' is toggled, set the defaultBoxState of the box location
                    boxData?.state === "Scrap" &&
                      boxData?.location?.__typename !== "DistributionSpot"
                      ? boxData?.location?.defaultBoxState!
                      : "Scrap",
                  )
                }
                mr={2}
              >
                <Switch.HiddenInput />
                <Switch.Control />
              </Switch.Root>
            )}
          </Flex>
          <Spacer />
          <Flex alignContent="center" direction="row">
            <Field.Label htmlFor="lost">Lost:</Field.Label>
            {isLoading && <SkeletonCircle height="20px" width="34px" mr={2} />}
            {!isLoading && (
              <Switch.Root
                id="lost"
                data-testid="box-lost-btn"
                disabled={
                  boxInTransit ||
                  boxData?.state === "NotDelivered" ||
                  (boxData?.location?.__typename !== "DistributionSpot" &&
                    boxData?.location?.defaultBoxState === "Lost") ||
                  !!boxData?.deletedOn
                }
                onCheckedChange={() =>
                  onStateChange(
                    // If the current box state 'Lost' is toggled, set the defaultBoxState of the box location
                    boxData?.state === "Lost" &&
                      boxData?.location?.__typename !== "DistributionSpot"
                      ? boxData?.location?.defaultBoxState!
                      : "Lost",
                  )
                }
                mr={2}
                checked={boxData?.state === "Lost"}
              >
                <Switch.HiddenInput />
                <Switch.Control />
              </Switch.Root>
            )}
          </Flex>
        </Flex>
      </Stack>

      {boxData?.history && boxData?.history?.length > 0 && (
        <>
          <Separator />
          <Stack py={2} px={4} alignContent="center">
            <Flex alignContent="center" direction="column">
              <Text fontSize="lg" fontWeight="bold">
                History: &nbsp;
              </Text>
              <Spacer />
              <Flex py={0} px={0} alignContent="space-between" verticalAlign="center">
                {!isLoading && <HistoryEntries data={boxData?.history} total={1} />}
                {isLoading && (
                  <SkeletonText lineClamp={3} width="100%" py={2} px={2} alignContent="center" />
                )}
                {boxData?.history && boxData?.history?.length > 1 && (
                  <>
                    <Spacer />
                    <IconButton
                      onClick={onHistoryOpen}
                      border="2px"
                      size="sm"
                      borderRadius="full"
                      aria-label="Show detail history"
                    >
                      <Icon as={MdHistory} h={6} w={6} />
                    </IconButton>
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
