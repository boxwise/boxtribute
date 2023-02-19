/* eslint-disable no-nested-ternary */
import { ArrowUpDownIcon, TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import {
  chakra,
  Flex,
  IconButton,
  Spacer,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { includesSomeObjectFilterFn } from "components/Table/Filter";
import { ReactNode, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Column, Row, useFilters, useSortBy, useTable } from "react-table";

interface ITableRowProps {
  row: Row<any>;
  children: ReactNode;
}

function TableRow({ row, children }: ITableRowProps) {
  const navigate = useNavigate();
  if (typeof row.original.href === "string" && row.original.href.length > 0) {
    return (
      <Tr
        onClick={() => navigate(row.original.href)}
        _hover={{ bg: "brandYellow.100" }}
        {...row.getRowProps()}
      >
        {children}
      </Tr>
    );
  }
  return <Tr {...row.getRowProps()}>{children}</Tr>;
}

interface IBasicTableProps {
  columns: Array<Column<any>>;
  tableData: Array<any>;
}

export function FilteringSortingTable({ columns, tableData }: IBasicTableProps) {
  // Add custom filter function to filter objects in a column
  // https://react-table-v7.tanstack.com/docs/examples/filtering
  const filterTypes = useMemo(
    () => ({
      includesSomeObject: includesSomeObjectFilterFn,
    }),
    [],
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data: tableData,
      filterTypes,
    },
    useFilters,
    useSortBy,
  );

  return (
    <TableContainer>
      <Table {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup) => (
            <Tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <Th {...column.getHeaderProps()}>
                  <Flex alignItems="center">
                    {column.canFilter && (
                      <chakra.span pr="1">{column.render("Filter")}</chakra.span>
                    )}
                    {column.render("Header")}
                    <Spacer />
                    <chakra.span pl="1">
                      <IconButton
                        size="xs"
                        background="inherit"
                        aria-label={`Toggle SortBy for '${column.render("Header")}'`}
                        icon={
                          column.isSorted ? (
                            column.isSortedDesc ? (
                              <TriangleDownIcon aria-label="sorted descending" />
                            ) : (
                              <TriangleUpIcon aria-label="sorted ascending" />
                            )
                          ) : (
                            <ArrowUpDownIcon />
                          )
                        }
                        {...column.getSortByToggleProps()}
                      />
                    </chakra.span>
                  </Flex>
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <TableRow row={row}>
                {row.cells.map((cell) => (
                  <Td {...cell.getCellProps()}>{cell.render("Cell")}</Td>
                ))}
              </TableRow>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
