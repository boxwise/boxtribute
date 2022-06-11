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
  FormControl,
  FormLabel,
  Code,
  Box,
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
import { MultiValue, Select } from "chakra-react-select";

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
        id: "productName",
        Filter: SelectColumnFilter,
        show: false,
      },
      {
        Header: "Box Number",
        accessor: "labelIdentifier",
        id: "labelIdentifier",
      },
      {
        Header: "Gender",
        accessor: "gender",
        id: "gender",
        Filter: SelectColumnFilter,
        filter: "equals",
      },
      {
        Header: "Size",
        accessor: "size",
        id: "size",
      },
      {
        Header: "Items",
        accessor: "items",
        id: "items",
      },
      {
        Header: "State",
        accessor: "state",
        id: "state",
        Filter: SelectColumnFilter,
        filter: "equals",
      },
      {
        Header: "Location",
        accessor: "location",
        id: "location",
        Filter: SelectColumnFilter,
        filter: "equals",
      },
    ],
    []
  );

  const [selectedColumns, setSelectedColumns] = React.useState<
    MultiValue<{
      label: string;
      value: string;
    }>
  >([]);

  const selectableColumnOptions = columns
    .map((column) => ({
      label: column.Header?.toString() || "",
      value: column.accessor?.toString() || "",
    }))
    .filter((value) => value !== undefined);

  // const hiddenColumns =
  //   React.useMemo(
  //     () =>
  //   columns
  //     .filter(
  //       (column) =>
  //         column.Header == null ||
  //         selectedColumns
  //           .map((selectedColumn) => selectedColumn.label)
  //           .includes(column.Header.toString())
  //     )
  //     .map((column) => column.id)
  //     .filter((id) => id != null) as string[],
  //     [columns, selectedColumns]
  //   );// || [];

    // const hiddenColumns = ["labelIdentifier","gender","items","state","location"];

    const finalSelectedColumns = columns.filter(column => column.Header != null && selectedColumns.map(col => col.value).includes(column.accessor));

  return (
    <>
      <FormControl p={4}>
        <FormLabel>
          Select Colors and Flavours <Code>size="sm"</Code>
        </FormLabel>
        <Select
          isMulti
          name="colors"
          options={selectableColumnOptions}
          placeholder="Select some colors..."
          closeMenuOnSelect={false}
          onChange={(selected) => {
            setSelectedColumns(selected);
          }}
          value={selectedColumns}
          size="sm"
        />
      </FormControl>
      {/* <Box>HIDDEN COLUMNS: {JSON.stringify(hiddenColumns)}</Box> */}
      <Box>columns: {JSON.stringify(columns)}</Box>
      <Box>selectedColumns: {JSON.stringify(selectedColumns)}</Box>
      <Box>Final Selected Columns: {JSON.stringify(finalSelectedColumns)}</Box>
      <ActualTable
        columns={finalSelectedColumns}
        tableData={tableData}
        onBoxRowClick={onBoxRowClick}
        hiddenColumns={[]}
      />
      ;
    </>
  );
};

interface ActualTableProps {
  columns: Column<BoxRow>[];
  tableData: BoxRow[];
  onBoxRowClick: (labelIdentified: string) => void;
  hiddenColumns: string[];
}
const ActualTable = ({ columns, tableData, onBoxRowClick, hiddenColumns }: ActualTableProps) => {
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
        // hiddenColumns: ["productName", "size"],
        hiddenColumns: hiddenColumns,
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

  // const groupedOptions = [
  //   {
  //     label: "Columns",
  //     options: columns
  //       .map((column) => ({
  //         label: column.Header,
  //         value: column.accessor,
  //       }))
  //       .filter((value) => value !== undefined),
  //   },
  // ];
  return (
    <>
      <Flex alignItems="center" flexWrap="wrap">
        {/* <Select
          // name={name}
          // ref={ref}
          // onChange={onChange}
          // onBlur={onBlur}
          value={value}
          options={productsForDropdownGroups}
          placeholder="Product"
          isSearchable
        /> */}

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
