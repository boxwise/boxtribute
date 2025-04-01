import _ from "lodash";
import { useMemo } from "react";
import ShipmentReceivingTable from "./ShipmentReceivingTable";
import { ShipmentDetailWithAutomatchProduct } from "queries/types";

interface IShipmentReceivingContentProps {
  items: ShipmentDetailWithAutomatchProduct[];
  onReconciliationBox: (id: string) => void;
}

function ShipmentReceivingContent({ items, onReconciliationBox }: IShipmentReceivingContentProps) {
  const boxes = _(items.filter((b) => b.box.state === "Receiving"))
    .map((shipmentDetail) => ({
      id: shipmentDetail?.sourceProduct?.id,
      labelIdentifier: shipmentDetail?.box?.labelIdentifier,
      product: shipmentDetail.sourceProduct?.name,
      comment: shipmentDetail?.box?.comment,
      gender: shipmentDetail.sourceProduct?.gender,
      size: shipmentDetail?.sourceSize?.label,
      items: shipmentDetail?.sourceQuantity || 0,
      autoMatchingTargetProduct: shipmentDetail?.autoMatchingTargetProduct,
    }))
    .sortBy([(b) => !b.autoMatchingTargetProduct, (b) => b.product])
    .value();

  // Define columns
  const columns = useMemo(
    () => [
      {
        id: "labelIdentifier",
        Header: "BOX #",
        accessor: "labelIdentifier",
      },
      {
        id: "product",
        Header: "PRODUCT",
        style: { overflowWrap: "break-word" },
        accessor: "product",
      },
      {
        id: "gender",
        Header: "Gender",
        accessor: "gender",
      },
    ],
    [],
  );

  return (
    <ShipmentReceivingTable
      columns={columns}
      data={boxes}
      onReconciliationBox={onReconciliationBox}
    />
  );
}

export default ShipmentReceivingContent;
