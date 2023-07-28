import { useReactiveVar } from "@apollo/client";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Wrap,
  WrapItem,
  IconButton,
  ModalBody,
  SkeletonText,
  ModalFooter,
} from "@chakra-ui/react";
import { boxReconciliationOverlayVar } from "queries/cache";
import { BiTrash } from "react-icons/bi";
import { ProductGender, ShipmentDetail } from "types/generated/graphql";

import { BoxReconcilationAccordion } from "./BoxReconciliationAccordion";

export interface ICategoryData {
  name: string;
}

export interface ISizeData {
  id: string;
  label: string;
}

export interface ISizeRangeData {
  label?: string;
  sizes: ISizeData[];
}

export interface IProductWithSizeRangeData {
  id: string;
  name: string;
  gender?: ProductGender | undefined | null;
  category: ICategoryData;
  sizeRange: ISizeRangeData;
}

export interface ILocationData {
  id: string;
  name: string;
  seq?: number | null | undefined;
}

interface IBoxReconciliationContainerProps {
  shipmentDetail: ShipmentDetail;
  productAndSizesData: IProductWithSizeRangeData[];
  allLocations: ILocationData[];
  loading: boolean;
  mutationLoading: boolean;
  closeOnEsc: boolean;
  closeOnOverlayClick: boolean;
  onClose: () => void;
  onBoxUndelivered: (labelIdentifier: string) => void;
  onBoxDelivered: (
    labelIdentifier: string,
    locationId: number | undefined,
    productId: number | undefined,
    sizeId: number | undefined,
    numberOfItems: number | undefined,
  ) => void;
}

export function BoxReconciliationView({
  shipmentDetail,
  productAndSizesData,
  allLocations,
  loading,
  mutationLoading,
  onClose,
  onBoxUndelivered,
  onBoxDelivered,
  closeOnOverlayClick = true,
  closeOnEsc = true,
}: IBoxReconciliationContainerProps) {
  const boxReconciliationOverlayState = useReactiveVar(boxReconciliationOverlayVar);

  return (
    <Modal
      isOpen={boxReconciliationOverlayState.isOpen}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEsc={closeOnEsc}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize={28} fontWeight="extrabold">
          <Wrap as="span" flex="1" alignItems="center" justifyContent="space-between">
            <WrapItem>Box {shipmentDetail?.box.labelIdentifier}</WrapItem>
            <WrapItem>
              <IconButton
                isRound
                icon={<BiTrash size={30} />}
                style={{ background: "white" }}
                aria-label="no delivery"
                onClick={() => onBoxUndelivered(shipmentDetail?.box.labelIdentifier)}
              />
            </WrapItem>
          </Wrap>
        </ModalHeader>
        <ModalBody m={0} p={0}>
          {!loading && shipmentDetail && (
            <BoxReconcilationAccordion
              loading={mutationLoading}
              productAndSizesData={productAndSizesData}
              allLocations={allLocations}
              shipmentDetail={shipmentDetail}
              onBoxUndelivered={onBoxUndelivered}
              onBoxDelivered={onBoxDelivered}
            />
          )}
          {loading && <SkeletonText noOfLines={5} />}
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}
