import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { useMemo } from "react";
import { useTable } from "react-table";
import { Box } from "types/generated/graphql";

interface IShipmentTablePros {
  boxes: Box[];
}

function ShipmentTable({ boxes }: IShipmentTablePros) {
  // Define columns
  const columns = useMemo(
    () => [
      {
        Header: "BOX #",
        accessor: "labelIdentifier",
      },
      {
        Header: "PRODUCT",
        accessor: "product",
      },
      {
        Header: "ITEMS",
        accessor: "items",
      },
      {
        Header: "",
        accessor: "id",
        // eslint-disable-next-line react/no-unstable-nested-components
        // Cell: ({value}) => (<DeleteIcon onClick={handleDelete}  />)
      },
    ],
    [],
  );

  const boxRows = boxes.map((box) => ({
    labelIdentifier: box.labelIdentifier,
    // eslint-disable-next-line max-len
    product: `${`${box?.size?.label || ""} ` || ""}${`${box?.product?.gender || ""} ` || ""}${
      box.product?.name
    }`,
    items: box.numberOfItems || 0,
    id: parseInt(box.id, 10),
  }));

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: boxRows,
  });

  return (
    <TableContainer>
      <Table {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup) => (
            <Tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <Th {...column.getHeaderProps()}>{column.render("Header")}</Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <Tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <Td {...cell.getCellProps()}>{cell.render("Cell")}</Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export default ShipmentTable;
