import React from "react"; 
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Button, Table, Thead, Tr, Th, chakra, Tbody, Td } from "@chakra-ui/react";
import { Column, useTable, useFilters, useGlobalFilter, useSortBy } from "react-table";
import { ProductRow } from "./types";
import { GlobalFilter } from "./GlobalFilter";
import { SelectColumnFilter } from "./SelectColumnFilter";

type BoxesTableProps = {
    tableData: ProductRow[];
  };
  
  const BoxesTable = ({ tableData }: BoxesTableProps) => {
    const columns: Column<ProductRow>[] = React.useMemo(
      () => [
        {
          Header: "Product",
          accessor: "name",
        },
        {
          Header: "Box ID",
          accessor: "id",
        },
        {
          Header: "Gender",
          accessor: "gender",
          Filter: SelectColumnFilter,
          filter: "equals",
        },
        {
          Header: "Size",
          accessor: "size",
        },
        {
          Header: "Items",
          accessor: "items",
        },
        {
          Header: "State",
          accessor: "state",
          Filter: SelectColumnFilter,
          filter: "equals",
        },
      ],
      [],
    );
  
    const {
      headerGroups,
      rows,
      prepareRow,
      state: { globalFilter },
      setGlobalFilter,
    } = useTable(
      {
        columns,
        data: tableData
      },
      useFilters,
      useGlobalFilter,
      useSortBy
    );
  
    return (
      <>
        <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
  
        {headerGroups.map((headerGroup) =>
          headerGroup.headers.map((column) =>
            column.Filter ? (
              <Button m={2} key={column.id}>
                <label htmlFor={column.id}>{column.render("Header")}: </label>
                {column.render("Filter")}
              </Button>
            ) : null,
          ),
        )}
        <Table>
          <Thead>
            {headerGroups.map((headerGroup, i) => (
              <Tr {...headerGroup.getHeaderGroupProps()} key={i}>
                {headerGroup.headers.map((column) => (
                  <Th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render("Header")}
                    <chakra.span pl="4">
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <TriangleDownIcon aria-label="sorted descending" />
                        ) : (
                          <TriangleUpIcon aria-label="sorted ascending" />
                        )
                      ) : null}
                    </chakra.span>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {rows.map((row, i) => {
              prepareRow(row);
              return (
                <Tr key={i}>
                  {row.cells.map((cell, i) => {
                    return <Td key={i}>{cell.render("Cell")}</Td>;
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </>
    );
  };
  
  export default BoxesTable;