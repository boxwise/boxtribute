import {
  Box as BoxWrapper,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { Column, useTable, useBlockLayout } from "react-table";

interface IShipmentTablePros {
  columns: Array<Column<any>>;
  data: Array<any>;
}

function ShipmentTable({ columns, data }: IShipmentTablePros) {
  const tableData = useMemo(() => data, [data]);

  const tableInstance = useTable({
    columns,
    data: tableData,
    useBlockLayout,
    initialState: {
      hiddenColumns: columns
        .filter((col: any) => col.show === false)
        .map((col) => col.id || col.accessor) as any,
    },
  });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const maxTableWidth = useBreakpointValue({ base: "full", md: "100%" });

  return (
    <BoxWrapper overflowX="hidden" overflowY="hidden">
      <TableContainer maxW={maxTableWidth}>
        <Table {...getTableProps()} variant="simple" size="sm">
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
                    <Td
                      {...cell.getCellProps()}
                      style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", fontSize: "xs" }}
                    >
                      {cell.render("Cell")}
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </BoxWrapper>
  );
}

export default ShipmentTable;
