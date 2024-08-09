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
import { Column, useTable } from "react-table";

interface IShipmentTablePros {
  columns: Array<Column<any>>;
  data: Array<any>;
}

function ShipmentTable({ columns, data }: IShipmentTablePros) {
  const tableData = useMemo(() => data, [data]);

  const tableInstance = useTable({
    columns,
    data: tableData,
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
            {headerGroups.map((headerGroup, idx) => (
              <Tr {...headerGroup.getHeaderGroupProps()} key={idx}>
                {headerGroup.headers.map((column, idx) => (
                  <Th {...column.getHeaderProps()} key={idx}>
                    {column.render("Header")}
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody {...getTableBodyProps()}>
            {rows.map((row, idx) => {
              prepareRow(row);
              return (
                <Tr {...row.getRowProps()} key={idx}>
                  {row.cells.map((cell, idx) => (
                    <Td
                      data-testid={cell.column.id}
                      {...cell.getCellProps()}
                      key={idx}
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
