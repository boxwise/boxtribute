import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Button,
  VStack,
  Text,
  chakra,
  HStack,
  Wrap,
} from "@chakra-ui/react";
import { AiFillWarning } from "react-icons/ai";
import { ShipmentState } from "types/generated/graphql";

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
  //   onSend: (id: string) => void;
  //   onStartReceiving: (id: string) => void;
  onCancel: (id: string) => void;
  onRemainingBoxesUndelivered: () => void;
}

function ShipmentOverlay({
  isLoading,
  isOpen,
  shipmentOverlayData: data,
  onClose,
  //   onSend,
  //   onStartReceiving,
  onCancel,
  onRemainingBoxesUndelivered,
}: IShipmentsOverlayProps) {
  let title = "";
  let body;
  let leftButtonProps = {};
  let leftButtonText = "Nevermind";
  let rightButtonProps = {};
  let rightButtonText = "Nevermind";

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
    leftButtonProps = { onClick: () => onClose() };
    leftButtonText = "Nevermind";
    rightButtonProps = {
      colorScheme: "red",
      onClick: () => onCancel(data.id),
    };
    rightButtonText = "Yes, Cancel";
  } else if (data?.state === ShipmentState.Receiving) {
    title = "Remaining Boxes Not Delivered?";
    body = (
      <VStack align="start" spacing={8}>
        <chakra.span>
          <Text>
            This will mark the remaining boxes as undelivered and will complete the shipment.
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
    leftButtonProps = { onClick: () => onClose() };
    leftButtonText = "Nevermind";
    rightButtonProps = {
      colorScheme: "red",
      onClick: () => onRemainingBoxesUndelivered(),
    };
    rightButtonText = "Confirm & Complete";
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="0">
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{body}</ModalBody>
        <ModalFooter>
          <HStack spacing={4}>
            <Button isLoading={isLoading} {...leftButtonProps}>
              {leftButtonText}
            </Button>
            <Button isLoading={isLoading} {...rightButtonProps}>
              {rightButtonText}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ShipmentOverlay;
