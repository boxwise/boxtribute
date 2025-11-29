import { Box, Button, ButtonProps, VStack } from "@chakra-ui/react";
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
  const sendButtonProps: ButtonProps = {
    colorPalette: "green",
    disabled: shipmentContents.length === 0,
    loading: isLoadingFromMutation,
    variant: "solid",
    onClick: onSend,
    marginTop: 2,
  };

  const cancelButtonProps: ButtonProps = {
    colorPalette: "red",
    disabled: shipmentContents.length === 0,
    loading: isLoadingFromMutation,
    variant: "solid",
    onClick: onCancel,
    marginTop: 2,
  };

  const receiveButtonProps: ButtonProps = {
    colorPalette: "green",
    disabled: shipmentContents.length === 0,
    loading: isLoadingFromMutation,
    variant: "solid",
    onClick: onReceive,
    size: "md",
    marginTop: 2,
  };

  const lostButtonProps: ButtonProps = {
    colorPalette: "red",
    disabled: shipmentContents.length === 0,
    loading: isLoadingFromMutation,
    variant: "outline",
    onClick: openShipmentOverlay,
    size: "md",
    marginTop: 2,
  };

  const remainingBoxesUndeliveredButtonProps: ButtonProps = {
    colorPalette: "red",
    disabled: shipmentContents.length === 0,
    loading: isLoadingFromMutation,
    variant: "outline",
    onClick: openShipmentOverlay,
    size: "md",
    marginTop: 2,
  };

  if ("Preparing" === shipmentState && isSender) {
    return (
      <Button {...sendButtonProps}>
        <SendingIcon />
        Finalize & Send
      </Button>
    );
  }
  if ("Sent" === shipmentState && isSender) {
    return (
      <Button {...lostButtonProps}>
        <TbMapOff />
        Cannot Locate Shipment
      </Button>
    );
  }
  if ("Preparing" === shipmentState && !isSender) {
    return <Button {...cancelButtonProps}>Reject</Button>;
  }
  if ("Receiving" === shipmentState && !isSender) {
    return (
      <Button {...remainingBoxesUndeliveredButtonProps}>
        <BiTrash />
        Remaining Boxes Not Delivered
      </Button>
    );
  }
  if ("Sent" === shipmentState && !isSender) {
    return (
      <VStack align="stretch" gap={1}>
        <Button {...receiveButtonProps}>
          <ReceivingIcon />
          Receive Shipment
        </Button>
        <Button {...lostButtonProps}>
          <TbMapOff />
          Cannot Locate Shipment
        </Button>
      </VStack>
    );
  }

  return <Box />;
}

export default ShipmentActionButtons;
