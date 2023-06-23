import { Box, Button, VStack } from "@chakra-ui/react";
import { ReceivingIcon } from "components/Icon/Transfer/ReceivingIcon";
import { SendingIcon } from "components/Icon/Transfer/SendingIcon";
import { BiTrash } from "react-icons/bi";
import { TbMapOff } from "react-icons/tb";
import { ShipmentDetail, ShipmentState } from "types/generated/graphql";

export interface IShipmentActionButtonsProps {
  isLoadingFromMutation: boolean | undefined;
  shipmentState: ShipmentState | null | undefined;
  shipmentContents: ShipmentDetail[];
  isSender: boolean;
  onCancel: () => void;
  onLost: () => void;
  onSend: () => void;
  onReceive: () => void;
  openShipmentOverlay: () => void;
}

function ShipmentActionButtons({
  isLoadingFromMutation,
  shipmentState,
  shipmentContents,
  isSender,
  onCancel,
  onLost,
  onSend,
  onReceive,
  openShipmentOverlay,
}: IShipmentActionButtonsProps) {
  const sendButtonProps = {
    leftIcon: <SendingIcon />,
    colorScheme: "green",
    isDisabled: shipmentContents.length === 0,
    isLoading: isLoadingFromMutation,
    variant: "solid",
    onClick: onSend,
    marginTop: 2,
  };

  const cancelButtonProps = {
    colorScheme: "red",
    isDisabled: shipmentContents.length === 0,
    isLoading: isLoadingFromMutation,
    variant: "solid",
    onClick: onCancel,
    marginTop: 2,
  };

  const receiveButtonProps = {
    leftIcon: <ReceivingIcon />,
    colorScheme: "green",
    isDisabled: shipmentContents.length === 0,
    isLoading: isLoadingFromMutation,
    variant: "solid",
    onClick: onReceive,
    size: "md",
    marginTop: 2,
  };

  const lostButtonProps = {
    leftIcon: <TbMapOff />,
    colorScheme: "red",
    isDisabled: shipmentContents.length === 0,
    isLoading: isLoadingFromMutation,
    variant: "ghost",
    onClick: onLost,
    size: "md",
    marginTop: 2,
  };

  const remainingBoxesUndeliveredButtonProps = {
    leftIcon: <BiTrash />,
    colorScheme: "red",
    isDisabled: shipmentContents.length === 0,
    isLoading: isLoadingFromMutation,
    variant: "ghost",
    onClick: openShipmentOverlay,
    size: "md",
    marginTop: 2,
  };

  if (ShipmentState.Preparing === shipmentState && isSender) {
    return <Button {...sendButtonProps}>Finalize & Send</Button>;
  }
  if (ShipmentState.Sent === shipmentState && isSender) {
    return <Button {...lostButtonProps}>Cannot Locate Shipment</Button>;
  }
  if (ShipmentState.Preparing === shipmentState && !isSender) {
    return <Button {...cancelButtonProps}>Reject</Button>;
  }
  if (ShipmentState.Receiving === shipmentState && !isSender) {
    return <Button {...remainingBoxesUndeliveredButtonProps}>Remaining Boxes Not Delivered</Button>;
  }
  if (ShipmentState.Sent === shipmentState && !isSender) {
    return (
      <VStack align="stretch" spacing={1}>
        <Button {...receiveButtonProps}>Receive Shipment</Button>
        <Button {...lostButtonProps}>Cannot Locate Shipment</Button>
      </VStack>
    );
  }

  return <Box />;
}

export default ShipmentActionButtons;
