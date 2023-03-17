import { Box, Stack } from "@chakra-ui/react";
import _ from "lodash";
import { useMemo } from "react";
import { CellProps } from "react-table";
import { ShipmentDetail } from "types/generated/graphql";
import ShipmentReceivingTable from "./ShipmentReceivingTable";

interface IShipmentReceivingContentProps {
  items: ShipmentDetail[];
}

function ShipmentReceivingContent({ items }: IShipmentReceivingContentProps) {
  const boxes = _.map(items, (shipmentDetail) => ({
    id: shipmentDetail?.sourceProduct?.id,
    labelIdentifier: shipmentDetail?.box?.labelIdentifier,
    product: shipmentDetail.sourceProduct?.name,
    gender: shipmentDetail.sourceProduct?.gender,
    items: shipmentDetail?.box?.numberOfItems || 0,
  }));

  // eslint-disable-next-line no-console
  console.log("boxes", boxes);

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
        // eslint-disable-next-line react/no-unstable-nested-components
        Cell: ({ row }: CellProps<any>) => (
          <Stack direction="row">
            <Box>{row.original.product}</Box>
            <Box>{row.original.gender}</Box>
          </Stack>
        ),
      },
      {
        id: "gender",
        Header: "Gender",
      },
      {
        id: "id",
        Header: "",
      },
    ],
    [],
  );

  return <ShipmentReceivingTable columns={columns} data={boxes} />;
}

export default ShipmentReceivingContent;
