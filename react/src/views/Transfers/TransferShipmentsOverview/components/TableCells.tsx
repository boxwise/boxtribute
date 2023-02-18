import { chakra, Stack, VStack } from "@chakra-ui/react";
import { BidirectionalIcon } from "components/Icon/Transfer/BidirectionalIcon";
import { ReceivingIcon } from "components/Icon/Transfer/ReceivingIcon";
import { SendingIcon } from "components/Icon/Transfer/SendingIcon";
import { CellProps } from "react-table";

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
      <chakra.span>{value.base}</chakra.span>
      <chakra.span>{value.organisation}</chakra.span>
    </VStack>
  );
}
