import { Table } from "@chakra-ui/react";
import {
  includesOneOfMultipleStringsFilterFn,
  includesSomeObjectFilterFn,
} from "components/Table/Filter";
import { ReactNode, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Column, Row, useFilters, useSortBy, useTable } from "react-table";
import { FilteringSortingTableHeader } from "./TableHeader";

interface ITableRowProps {
  row: Row<any>;
  children: ReactNode;
}

function TableRow({ row, children }: ITableRowProps) {
  const navigate = useNavigate();
  const { key, ...props } = row.getRowProps();
  if (typeof row.original.href === "string" && row.original.href.length > 0) {
    return (
      <Table.Row
        onClick={() => navigate(row.original.href)}
        _hover={{ bg: "brandYellow.100" }}
        cursor="pointer"
        key={key}
        {...props}
      >
        {children}
      </Table.Row>
    );
  }
  return (
    <Table.Row key={key} {...props}>
      {children}
    </Table.Row>
  );
}

interface IInitialStateFilters {
  id: string;
  value: any;
}

interface IInitialState {
  filters?: IInitialStateFilters[];
  sortBy?: { id: string; desc: boolean }[];
}

interface IBasicTableProps {
  columns: Array<Column<any>>;
  tableData: Array<any>;
  initialState?: IInitialState;
}

export function FilteringSortingTable({ columns, tableData, initialState = {} }: IBasicTableProps) {
  // Add custom filter function to filter objects in a column
  // https://react-table-v7.tanstack.com/docs/examples/filtering
  const filterTypes = useMemo(
    () => ({
      includesSomeObject: includesSomeObjectFilterFn,
      includesOneOfMultipleStrings: includesOneOfMultipleStringsFilterFn,
    }),
    [],
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data: tableData,
      filterTypes,
      // needed if filter should be applied on load of the table
      initialState,
    },
    useFilters,
    useSortBy,
  );

  return (
    <Table.ScrollArea>
      <Table.Root {...getTableProps()}>
        <FilteringSortingTableHeader headerGroups={headerGroups} />
        <Table.Body {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <TableRow key={row.index} row={row}>
                {row.cells.map((cell, idx) => (
                  <Table.Cell {...cell.getCellProps()} key={idx}>
                    {cell.render("Cell")}
                  </Table.Cell>
                ))}
              </TableRow>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}
