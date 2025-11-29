import { Box as BoxWrapper, Table, useBreakpointValue } from "@chakra-ui/react";
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
      <Table.ScrollArea maxW={maxTableWidth}>
        <Table.Root {...getTableProps()} size="sm">
          <Table.Header>
            {headerGroups.map((headerGroup, idx) => (
              <Table.Row {...headerGroup.getHeaderGroupProps()} key={idx}>
                {headerGroup.headers.map((column, idx) => (
                  <Table.ColumnHeader {...column.getHeaderProps()} key={idx}>
                    {column.render("Header")}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body {...getTableBodyProps()}>
            {rows.map((row, idx) => {
              prepareRow(row);
              return (
                <Table.Row {...row.getRowProps()} key={idx}>
                  {row.cells.map((cell, idx) => (
                    <Table.Cell
                      data-testid={cell.column.id}
                      {...cell.getCellProps()}
                      key={idx}
                      style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", fontSize: "xs" }}
                    >
                      {cell.render("Cell")}
                    </Table.Cell>
                  ))}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </BoxWrapper>
  );
}

export default ShipmentTable;
