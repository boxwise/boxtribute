import { VStack, Text, chakra, HStack, Wrap } from "@chakra-ui/react";
import { AreYouSureDialog } from "components/AreYouSure";
import { AiFillWarning } from "react-icons/ai";
import { BoxState, ShipmentState } from "types/generated/graphql";

export interface IShipmentOverlayData {
  id: string;
  state: ShipmentState;
  sourceOrg: string;
  targetOrg: string;
}

interface IShipmentsOverlayProps {
  isLoading: boolean;
  isOpen: boolean;
  shipmentOverlayData: IShipmentOverlayData | undefined;
  onClose: () => void;
  onLost: () => void;
  onCancel: (id: string) => void;
  onRemainingBoxesUndelivered: () => void;
}

function ShipmentOverlay({
  isLoading,
  isOpen,
  shipmentOverlayData: data,
  onClose,
  onLost,
  onCancel,
  onRemainingBoxesUndelivered,
}: IShipmentsOverlayProps) {
  let title = "";
  let body;
  const leftButtonText = "Nevermind";
  const leftButtonProps = {};
  const onLeftButtonClick = () => onClose();
  let rightButtonText = "Nevermind";
  let rightButtonProps = {};
  let onRightButtonClick = () => onClose();

  if (data?.state === ShipmentState.Preparing) {
    title = "Cancel Whole Shipment?";
    body = (
      <VStack align="start" spacing={8}>
        <chakra.span>
          <Text>
            This will archive this shipment and will return all boxes to their original locations.
          </Text>
        </chakra.span>
        <chakra.br />
        <chakra.span>
          Neither <Text as="b">{data.sourceOrg}</Text> nor <Text as="b">{data.targetOrg}</Text> will
          be able to make further changes to the shipment.
        </chakra.span>
      </VStack>
    );
    rightButtonText = "Yes, Cancel";
    rightButtonProps = {
      colorScheme: "red",
    };
    onRightButtonClick = () => onCancel(data.id);
  } else if (data?.state === ShipmentState.Receiving) {
    title = "Remaining Boxes Not Delivered?";
    body = (
      <VStack align="start" spacing={8}>
        <chakra.span>
          <Text>
            This will mark the remaining boxes as{" "}
            <Text as="b" colorScheme="red">
              NotDelivered
            </Text>{" "}
            and will complete the shipment.
          </Text>
        </chakra.span>
        <chakra.br />
        <chakra.span>
          <HStack>
            <Wrap align="baseline">
              <AiFillWarning
                alignmentBaseline="middle"
                size={20}
                style={{ cursor: "pointer", color: "orange", fill: "orange" }}
              />
              <Text as="b">WARNING:</Text>
              Neither
              <Text as="b">{data.sourceOrg}</Text> nor <Text as="b">{data.targetOrg}</Text> will be
              able to make further changes to the shipment.
            </Wrap>
          </HStack>
        </chakra.span>
      </VStack>
    );
    rightButtonText = "Confirm & Complete";
    rightButtonProps = {
      colorScheme: "red",
    };
    onRightButtonClick = () => onRemainingBoxesUndelivered();
  } else if (data?.state === ShipmentState.Sent) {
    title = "Cannot Locate Shipment?";
    body = (
      <VStack align="start" spacing={8}>
        <chakra.span>
          <Text>
            Confirming this will mark the shipment as{" "}
            <chakra.span color="red.500" fontWeight="semibold">
              {ShipmentState.Lost}
            </chakra.span>{" "}
            and all boxes as{" "}
            <chakra.span color="red.500" fontWeight="semibold">
              {BoxState.NotDelivered}
            </chakra.span>
            , effectively cancelling the shipment.
          </Text>
        </chakra.span>
        <chakra.br />
        <chakra.span>
          <HStack>
            <Wrap align="baseline">
              <AiFillWarning
                alignmentBaseline="middle"
                size={20}
                style={{ cursor: "pointer", color: "orange", fill: "orange" }}
              />
              <Text as="b">WARNING: This action cannot be undone</Text>
              <chakra.br />
              <Text>
                Neither <Text as="b">{data.sourceOrg}</Text> nor{" "}
                <Text as="b">{data.targetOrg}</Text> will be able to make further changes to the
                shipment.
              </Text>
            </Wrap>
          </HStack>
        </chakra.span>
      </VStack>
    );
    rightButtonText = "Confirm";
    rightButtonProps = {
      colorScheme: "red",
    };
    onRightButtonClick = () => onLost();
  }

  return (
    <AreYouSureDialog
      body={body}
      title={title}
      onClose={onClose}
      isLoading={isLoading}
      isOpen={isOpen}
      leftButtonText={leftButtonText}
      leftButtonProps={leftButtonProps}
      rightButtonText={rightButtonText}
      rightButtonProps={rightButtonProps}
      onLeftButtonClick={onLeftButtonClick}
      onRightButtonClick={onRightButtonClick}
    />
  );
}

export default ShipmentOverlay;
