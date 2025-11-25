import { Box, Button, VStack } from "@chakra-ui/react";
import { ReceivingIcon } from "components/Icon/Transfer/ReceivingIcon";
import { SendingIcon } from "components/Icon/Transfer/SendingIcon";
import { BiTrash } from "react-icons/bi";
import { TbMapOff } from "react-icons/tb";
import { ShipmentDetail, ShipmentState } from "queries/types";

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
  onSend,
  onReceive,
  openShipmentOverlay,
}: IShipmentActionButtonsProps) {
  const sendButtonProps = {
    leftIcon: <SendingIcon />,
    colorPalette: "green",
    disabled: shipmentContents.length === 0,
    isLoading: isLoadingFromMutation,
    variant: "solid",
    onClick: onSend,
    marginTop: 2,
  };

  const cancelButtonProps = {
    colorPalette: "red",
    disabled: shipmentContents.length === 0,
    isLoading: isLoadingFromMutation,
    variant: "solid",
    onClick: onCancel,
    marginTop: 2,
  };

  const receiveButtonProps = {
    leftIcon: <ReceivingIcon />,
    colorPalette: "green",
    disabled: shipmentContents.length === 0,
    isLoading: isLoadingFromMutation,
    variant: "solid",
    onClick: onReceive,
    size: "md",
    marginTop: 2,
  };

  const lostButtonProps = {
    leftIcon: <TbMapOff />,
    colorPalette: "red",
    disabled: shipmentContents.length === 0,
    isLoading: isLoadingFromMutation,
    variant: "outline",
    onClick: openShipmentOverlay,
    size: "md",
    marginTop: 2,
  };

  const remainingBoxesUndeliveredButtonProps = {
    leftIcon: <BiTrash />,
    colorPalette: "red",
    disabled: shipmentContents.length === 0,
    isLoading: isLoadingFromMutation,
    variant: "outline",
    onClick: openShipmentOverlay,
    size: "md",
    marginTop: 2,
  };

  if ("Preparing" === shipmentState && isSender) {
    return <Button {...sendButtonProps}>Finalize & Send</Button>;
  }
  if ("Sent" === shipmentState && isSender) {
    return <Button {...lostButtonProps}>Cannot Locate Shipment</Button>;
  }
  if ("Preparing" === shipmentState && !isSender) {
    return <Button {...cancelButtonProps}>Reject</Button>;
  }
  if ("Receiving" === shipmentState && !isSender) {
    return <Button {...remainingBoxesUndeliveredButtonProps}>Remaining Boxes Not Delivered</Button>;
  }
  if ("Sent" === shipmentState && !isSender) {
    return (
      <VStack align="stretch" gap={1}>
        <Button {...receiveButtonProps}>Receive Shipment</Button>
        <Button {...lostButtonProps}>Cannot Locate Shipment</Button>
      </VStack>
    );
  }

  return <Box />;
}

export default ShipmentActionButtons;
