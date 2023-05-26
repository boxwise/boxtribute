import _ from "lodash";
import { useMemo } from "react";
import { ShipmentDetail } from "types/generated/graphql";
import ShipmentReceivingTable from "./ShipmentReceivingTable";

interface IShipmentReceivingContentProps {
  items: ShipmentDetail[];
  onReconciliationBox: (id: string) => void;
}

function ShipmentReceivingContent({ items, onReconciliationBox }: IShipmentReceivingContentProps) {
  const boxes = _.map(items, (shipmentDetail) => ({
    id: shipmentDetail?.sourceProduct?.id,
    labelIdentifier: shipmentDetail?.box?.labelIdentifier,
    product: shipmentDetail.sourceProduct?.name,
    comment: shipmentDetail?.box?.comment,
    gender: shipmentDetail.sourceProduct?.gender,
    size: shipmentDetail.box.size.label,
    items: shipmentDetail?.box?.numberOfItems || 0,
  }));

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
