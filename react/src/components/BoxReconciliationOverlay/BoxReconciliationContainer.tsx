import { ProductGender, ShipmentDetail } from "types/generated/graphql";

import { BoxReconcilationAccordion } from "./components/BoxReconciliationAccordion";

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
  // allLocations: ILocationData[];
}

export function BoxReconciliationContainer({
  shipmentDetail,
  productAndSizesData,
}: // allLocations,
IBoxReconciliationContainerProps) {
  return (
    <BoxReconcilationAccordion
      productAndSizesData={productAndSizesData}
      // allLocations={allLocations}
      shipmentDetail={shipmentDetail}
    />
  );
}
