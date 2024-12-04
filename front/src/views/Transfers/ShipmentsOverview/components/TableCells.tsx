import { chakra, VStack } from "@chakra-ui/react";
import { CellProps } from "react-table";
import { ShipmentState } from "types/generated/graphql";

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
  return <chakra.span>{value ? (value === 1 ? "1 box" : `${value} boxes`) : ""}</chakra.span>;
}
