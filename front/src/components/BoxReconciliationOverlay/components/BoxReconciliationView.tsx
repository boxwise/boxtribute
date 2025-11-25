import {
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  Wrap,
  WrapItem,
  IconButton,
  DialogBody,
  SkeletonText,
  DialogFooter,
} from "@chakra-ui/react";
import { BiTrash } from "react-icons/bi";

import { BoxReconcilationAccordion } from "./BoxReconciliationAccordion";
import { ProductGender } from "../../../../../graphql/types";
import { ShipmentDetailWithAutomatchProduct } from "queries/types";

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

interface IBoxReconciliationViewProps {
  shipmentDetail: ShipmentDetailWithAutomatchProduct;
  productAndSizesData: IProductWithSizeRangeData[];
  allLocations: ILocationData[];
  open: boolean;
  loading: boolean;
  mutationLoading: boolean;
  closeOnEsc: boolean;
  closeOnOverlayClick: boolean;
  onClose: () => void;
  onBoxUndelivered: (labelIdentifier: string) => void;
  onBoxDelivered: (
    labelIdentifier: string,
    locationId: number,
    productId: number,
    sizeId: number,
    numberOfItems: number,
  ) => void;
}

export function BoxReconciliationView({
  shipmentDetail,
  productAndSizesData,
  allLocations,
  open,
  loading,
  mutationLoading,
  onClose,
  onBoxUndelivered,
  onBoxDelivered,
  closeOnOverlayClick = true,
  closeOnEsc = true,
}: IBoxReconciliationViewProps) {
  return (
    <DialogRoot
      open={open}
      closeOnInteractOutside={closeOnOverlayClick}
      closeOnEscape={closeOnEsc}
      onOpenChange={(e) => !e.open && onClose()}
    >
      <DialogBackdrop />
      <DialogContent>
        <DialogHeader fontSize={28} fontWeight="extrabold">
          <Wrap as="span" flex="1" alignItems="center" justifyContent="space-between">
            <WrapItem>Box {shipmentDetail?.box.labelIdentifier}</WrapItem>
            <WrapItem>
              <IconButton
                rounded="full"
                variant="ghost"
                style={{ background: "white" }}
                aria-label="no delivery"
                onClick={() => onBoxUndelivered(shipmentDetail?.box.labelIdentifier)}
                data-testid="NoDeliveryIcon"
              >
                <BiTrash size={30} />
              </IconButton>
            </WrapItem>
          </Wrap>
        </DialogHeader>
        <DialogBody m={0} p={0}>
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
          {loading && <SkeletonText lineClamp={5} />}
        </DialogBody>
        <DialogFooter />
      </DialogContent>
    </DialogRoot>
  );
}
