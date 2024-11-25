import { Box, Wrap, WrapItem } from "@chakra-ui/react";
import { ShipmentState } from "types/query-types";

export interface IShipmentColoredStatusProps {
  state: ShipmentState | undefined | null;
}

function ShipmentColoredStatus({ state }: IShipmentColoredStatusProps) {
  let stateColor;
  switch (state) {
    case "Preparing":
      stateColor = "blue.500";
      break;
    case "Receiving":
      stateColor = "blue.500";
      break;
    case "Canceled":
      stateColor = "red.500";
      break;
    case "Lost":
      stateColor = "red.500";
      break;
    case "Sent":
      stateColor = "green.500";
      break;
    case "Completed":
      stateColor = "black";
      break;
    default:
      stateColor = "black";
      break;
  }
  return (
    <Box fontSize={16} fontWeight="semibold">
      <Wrap>
        <WrapItem>Status:</WrapItem>
        <WrapItem color={stateColor}>{state?.toUpperCase()}</WrapItem>
      </Wrap>
    </Box>
  );
}

export default ShipmentColoredStatus;
