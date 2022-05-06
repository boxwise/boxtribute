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
import { ProductRow } from "./types";
import { GlobalFilter } from "./GlobalFilter";
import { SelectColumnFilter } from "./SelectColumnFilter";
import { useNavigate, useParams } from "react-router-dom";
import IndeterminateCheckbox from "./Checkbox";

type BoxesTableProps = {
  tableData: ProductRow[];
};

const BoxesTable = ({ tableData }: BoxesTableProps) => {
  const navigate = useNavigate();
  const baseId = useParams<{ baseId: string }>().baseId!;
  const columns: Column<ProductRow>[] = React.useMemo(
    () => [
      {
        Header: "Product",
        accessor: "name",
        Filter: SelectColumnFilter,
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
        Filter: SelectColumnFilter,
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
    []
  );

  const {
    headerGroups,

    prepareRow,
    state: { globalFilter, pageIndex, pageSize },
    setGlobalFilter,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,

    nextPage,
    previousPage,
  } = useTable(
    {
      columns,
      data: tableData,
      initialState: { pageIndex: 0, pageSize: 20 },
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
                onClick={() =>
                  navigate(
                    `/bases/${baseId}/boxes/${row.original.labelIdentifier}`
                  )
                }
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
      <Flex justifyContent="center" m={4} alignItems="center">
        <Flex>
          <IconButton
            aria-label="Previous Page"
            onClick={previousPage}
            isDisabled={!canPreviousPage}
            icon={<ChevronLeftIcon h={6} w={6} />}
          />
        </Flex>

        <Flex justifyContent="center" alignItems="center">
          <Text mr={8}>
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
