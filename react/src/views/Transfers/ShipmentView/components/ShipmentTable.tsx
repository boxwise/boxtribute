import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import _ from "lodash";
import { useMemo } from "react";
import { useTable, Column } from "react-table";
import { Box } from "types/generated/graphql";

interface IShipmentTableProps {
  boxes: Box[];
}

function ShipmentTable({ boxes }: IShipmentTableProps) {
  // Define columns
  const columns = useMemo<Column<Box>[]>(
    () => [
      {
        Header: "Label Identifier",
        accessor: "labelIdentifier",
      },
      {
        Header: "Product",
        // eslint-disable-next-line max-len
        accessor: (box) =>
          `${`${box?.product?.category.name || ""} ` || ""}${
            `${box?.product?.gender || ""} ` || ""
          }${box?.product?.name || ""}`,
      },
      {
        Header: "Items",
        accessor: "numberOfItems",
      },
      {
        Header: "ID",
        accessor: (box) => box?.product?.id || "1",
      },
    ],
    [],
  );

  const data = useMemo(() => boxes, [boxes]);

  const tableInstance = useTable<Box>({ columns, data });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

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
