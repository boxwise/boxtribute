import { chakra, Stack, VStack } from "@chakra-ui/react";
import { BidirectionalIcon } from "components/Icon/Transfer/BidirectionalIcon";
import { ReceivingIcon } from "components/Icon/Transfer/ReceivingIcon";
import { SendingIcon } from "components/Icon/Transfer/SendingIcon";
import { CellProps } from "react-table";
import { ShipmentState } from "types/generated/graphql";

export function DirectionCell({ value }: CellProps<any>) {
  if (value === "To") {
    return (
      <Stack isInline align="start">
        <SendingIcon />
        <chakra.span ml={1}>To</chakra.span>
      </Stack>
    );
  }
  if (value === "From") {
    return (
      <Stack isInline align="start">
        <ReceivingIcon />
        <chakra.span ml={1}>From</chakra.span>
      </Stack>
    );
  }
  return (
    <Stack isInline align="Bidirectional">
      <BidirectionalIcon />
      <chakra.span ml={1}>To / From</chakra.span>
    </Stack>
  );
}

export function BaseOrgCell({ value }: CellProps<any>) {
  return (
    <VStack align="start">
      <chakra.span as="b">{value.base}</chakra.span>
      <chakra.span>{value.organisation}</chakra.span>
    </VStack>
  );
}

export function StateCell({ value }: CellProps<any>) {
  let color = "inherit";

  // TODO: Receiving State is missing in type ShipmentState
  if (value === ShipmentState.Preparing || value === ShipmentState.Receiving) {
    color = "blue.700";
  } else if (value === ShipmentState.Sent) {
    color = "green.700";
  } else if (value === ShipmentState.Lost || value === ShipmentState.Canceled) {
    color = "red.700";
  }

  return (
    <chakra.span as="b" color={color}>
      {value}
    </chakra.span>
  );
}

export function BoxesCell({ value }: CellProps<any>) {
  return (
    // eslint-disable-next-line no-nested-ternary
    <chakra.span>{value ? (value === 1 ? "1 box" : `${value} boxes`) : ""}</chakra.span>
  );
}
