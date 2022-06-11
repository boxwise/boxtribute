import React from "react";
import {
  TriangleDownIcon,
  TriangleUpIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@chakra-ui/icons";
import {
  Button,
  Table,
  Thead,
  Tr,
  Th,
  chakra,
  Tbody,
  Td,
  Flex,
  Text,
  IconButton,
} from "@chakra-ui/react";
import {
  Column,
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useRowSelect,
  usePagination,
} from "react-table";
import { BoxRow } from "./types";
import { GlobalFilter } from "./GlobalFilter";
import { SelectColumnFilter } from "./SelectColumnFilter";
import IndeterminateCheckbox from "./Checkbox";

type BoxesTableProps = {
  tableData: BoxRow[];
  onBoxRowClick: (labelIdentified: string) => void;
};

const BoxesTable = ({ tableData, onBoxRowClick }: BoxesTableProps) => {
  const columns: Column<BoxRow>[] = React.useMemo(
    () => [
      {
        Header: "Product",
        accessor: "productName",
        Filter: SelectColumnFilter,
        show: false
      },
      {
        Header: "Box Number",
        accessor: "labelIdentifier",
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
      {
        Header: "Location",
        accessor: "location",
        Filter: SelectColumnFilter,
        filter: "equals",
      },
    ],
    []
  );

  
  const [selectedColumns, setSelectedColumns] = React.useState<string[]>([]);

  const hiddenColumns = React.useMemo(
    () =>
      columns
        .filter(
          (column) =>
            column.accessor == null ||
            !selectedColumns.includes(column.accessor.toString())
        )
        .map((column) => column.accessor?.toString() || ""),
    [columns, selectedColumns]
  );
  
  const {
    headerGroups,

    prepareRow,
    state: { globalFilter, pageIndex },
    setGlobalFilter,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,

    nextPage,
    previousPage,
  } = useTable(
    {
      columns,
      // hiddenColumns: columns.filter(column => !column.show).map(column => column.id),
      data: tableData,
      initialState: {
        pageIndex: 0,
        pageSize: 20,
        // hiddenColumns: hiddenColumns,
      },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  return (
    <>
      <Flex alignItems="center" flexWrap="wrap">
        <GlobalFilter
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />

        {headerGroups.map((headerGroup) => {
          return headerGroup.headers.map((column) =>
            column.Filter ? (
              <Button m={2} key={column.id}>
                <label htmlFor={column.id}>{column.render("Header")}: </label>
                {column.render("Filter")}
              </Button>
            ) : null
          );
        })}
      </Flex>

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
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <Tr
                cursor="pointer"
                {...row.getRowProps()}
                onClick={() => onBoxRowClick(row.original.labelIdentifier)}
                key={i}
              >
                {row.cells.map((cell, i) => {
                  return <Td key={i}>{cell.render("Cell")}</Td>;
                })}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <Flex justifyContent="center" alignItems="center">
        <Flex>
          <IconButton
            aria-label="Previous Page"
            onClick={previousPage}
            isDisabled={!canPreviousPage}
            icon={<ChevronLeftIcon h={6} w={6} />}
          />
        </Flex>

        <Flex justifyContent="center" m={4}>
          <Text>
            Page{" "}
            <Text fontWeight="bold" as="span">
              {pageIndex + 1}
            </Text>{" "}
            of{" "}
            <Text fontWeight="bold" as="span">
              {pageOptions.length}
            </Text>
          </Text>
        </Flex>

        <Flex>
          <IconButton
            aria-label="Next Page"
            onClick={nextPage}
            isDisabled={!canNextPage}
            icon={<ChevronRightIcon h={6} w={6} />}
          />
        </Flex>
      </Flex>
    </>
  );
};

export default BoxesTable;
