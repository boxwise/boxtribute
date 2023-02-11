import { chakra, Stack } from "@chakra-ui/react";
import { CellProps } from "react-table";
import { BidirectionalIcon, ReceivingIcon, SendingIcon } from "./TransferIcons";

export function DirectionCell({ value }: CellProps<any>) {
  if (value === "SendingTo") {
    return (
      <Stack isInline align="start">
        <SendingIcon />
        <chakra.span ml={1}>To</chakra.span>
      </Stack>
    );
  }
  if (value === "ReceivingFrom") {
    return (
      <Stack isInline align="start">
        <ReceivingIcon />
        <chakra.span ml={1}>From</chakra.span>
      </Stack>
    );
  }
  return (
    <Stack isInline align="start">
      <BidirectionalIcon />
      <chakra.span ml={1}>To / From</chakra.span>
    </Stack>
  );
}
