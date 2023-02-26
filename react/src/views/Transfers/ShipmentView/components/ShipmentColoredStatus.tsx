import { Box, Wrap, WrapItem } from "@chakra-ui/react";
import { ShipmentState } from "types/generated/graphql";

export interface IShipmentColoredStatusProps {
  state: ShipmentState | undefined | null;
}

function ShipmentColoredStatus({ state }: IShipmentColoredStatusProps) {
  let stateColor;
  switch (state) {
    case ShipmentState.Preparing:
      stateColor = "blue.500";
      break;
    case ShipmentState.Receiving:
      stateColor = "blue.500";
      break;
    case ShipmentState.Canceled:
      stateColor = "red.500";
      break;
    case ShipmentState.Lost:
      stateColor = "red.500";
      break;
    case ShipmentState.Sent:
      stateColor = "green.500";
      break;
    case ShipmentState.Completed:
      stateColor = "black";
      break;
    default:
      stateColor = "black";
      break;
  }
  return (
    <Box fontWeight="xl">
      <Wrap>
        <WrapItem>Status:</WrapItem>
        <WrapItem fontWeight="extrabold" color={stateColor}>
          {state?.toUpperCase()}
        </WrapItem>
      </Wrap>
    </Box>
  );
}

export default ShipmentColoredStatus;
