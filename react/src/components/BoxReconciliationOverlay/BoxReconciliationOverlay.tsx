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
import { BiTrash } from "react-icons/bi";
import { boxReconciliationOverlayVar } from "queries/cache";
import { ShipmentDetail } from "types/generated/graphql";
import { useReactiveVar } from "@apollo/client";
// import { useCallback, useState } from "react";
import { BoxReconciliationContainer } from "./BoxReconciliationContainer";

export interface IBoxReconciliationOverlayData {
  shipmentDetail: ShipmentDetail;
}

export function BoxReconcilationOverlay() {
  const boxReconciliationOverlayState = useReactiveVar(boxReconciliationOverlayVar);

  // const openBoxReconciliationOverlay = useCallback(() => {
  //   const shipmentDetail = data?.shipment?.details?.find(
  //     (detail) => detail.box.labelIdentifier === labelIdentifier && detail.removedOn === null,
  //   );
  //   setBoxReconciliationOverlayData({
  //     shipmentDetail,
  //   } as IBoxReconciliationOverlayData);
  //   onBoxReconciliationOpen();
  // }, [setBoxReconciliationOverlayData, onBoxReconciliationOpen, boxLabelIdentifier]);
  return (
    <Modal
      isOpen={boxReconciliationOverlayState.isOpen}
      closeOnOverlayClick
      closeOnEsc
      onClose={() => boxReconciliationOverlayVar({ isOpen: false, labelIdentifier: undefined })}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize={28} fontWeight="extrabold">
          <Wrap as="span" flex="1" alignItems="center" justifyContent="space-between">
            <WrapItem>Box {boxReconciliationOverlayState.labelIdentifier}</WrapItem>
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
          <BoxReconciliationContainer shipmentDetail={undefined} />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}
