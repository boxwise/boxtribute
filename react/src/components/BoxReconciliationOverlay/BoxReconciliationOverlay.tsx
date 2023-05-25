import {
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { BoxReconciliationContainer } from "components/BoxReconciliation/BoxReconciliationContainer";
import { BiTrash } from "react-icons/bi";
import { ShipmentDetail } from "types/generated/graphql";

export interface IBoxReconciliationOverlayData {
  shipmentDetail: ShipmentDetail;
}

export interface IBoxReconciliationOverlayProps {
  isOpen: boolean;
  boxReconcilationOverlayData: IBoxReconciliationOverlayData | undefined;
  onClose: () => void;
}

export function BoxReconcilationOverlay({
  isOpen,
  onClose,
  boxReconcilationOverlayData,
}: IBoxReconciliationOverlayProps) {
  return (
    <Modal isOpen={isOpen} closeOnOverlayClick closeOnEsc onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize={28} fontWeight="extrabold">
          <Wrap as="span" flex="1" alignItems="center" justifyContent="space-between">
            <WrapItem>
              Box {boxReconcilationOverlayData?.shipmentDetail.box.labelIdentifier}
            </WrapItem>
            <WrapItem>
              <IconButton
                isRound
                icon={<BiTrash size={30} />}
                style={{ background: "white" }}
                aria-label="no delivery"
              />
            </WrapItem>
          </Wrap>
        </ModalHeader>
        <ModalBody m={0} p={0}>
          <BoxReconciliationContainer
            shipmentDetail={boxReconcilationOverlayData?.shipmentDetail}
          />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}
