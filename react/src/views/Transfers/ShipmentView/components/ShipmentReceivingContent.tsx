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
        // eslint-disable-next-line react/no-unstable-nested-components
        Cell: ({ row, column, state }: CellProps<any>) => {
          const { sortBy } = state;
          return (
            <Stack direction="row">
              <Box
                fontWeight={column.isSorted && column.id === "labelIdentifier" ? "bold" : "normal"}
              >
                {row.original.labelIdentifier}
              </Box>
              <Box fontWeight={sortBy[0]?.id === "product" ? "bold" : "normal"}>
                {row.original.product}
              </Box>
              <Box fontWeight={sortBy[0]?.id === "gender" ? "bold" : "normal"}>
                {row.original.gender}
              </Box>
            </Stack>
          );
        },
      },
      {
        id: "product",
        Header: "PRODUCT",
        style: { overflowWrap: "break-word" },
        accessor: "product",
        // eslint-disable-next-line react/no-unstable-nested-components, no-empty-pattern
        Cell: ({}: CellProps<any>) => null,
      },
      {
        id: "gender",
        Header: "Gender",
        accessor: "gender",
        // eslint-disable-next-line no-empty-pattern
        Cell: ({}: CellProps<any>) => null,
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
