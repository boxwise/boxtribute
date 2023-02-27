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
} from "@chakra-ui/react";
import { ShipmentState } from "types/generated/graphql";

interface IShipmentsOverlayProps {
  isLoading: boolean;
  isOpen: boolean;
  shipmentOverlayData: any;
  onClose: () => void;
  //   onSend: (id: string) => void;
  //   onStartReceiving: (id: string) => void;
  onCancel: (id: string) => void;
}

function ShipmentOverlay({
  isLoading,
  isOpen,
  shipmentOverlayData: data,
  onClose,
  //   onSend,
  //   onStartReceiving,
  onCancel,
}: IShipmentsOverlayProps) {
  let title = "";
  let body;
  let leftButtonProps = {};
  let leftButtonText = "Nevermind";
  let rightButtonProps = {};
  let rightButtonText = "Nevermind";

  if (data.state === ShipmentState.Preparing) {
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
