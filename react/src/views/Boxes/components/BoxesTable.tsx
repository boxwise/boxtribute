import React, { useMemo, useState } from "react";
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
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Checkbox,
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

export type BoxesTableProps = {
  tableData: BoxRow[];
  onBoxRowClick: (labelIdentified: string) => void;
};

interface ColumnSelectorProps {
  availableColumns: Column<BoxRow>[];
  setSelectedColumns: (columns: Column<BoxRow>[]) => void;
  selectedColumns: Column<BoxRow>[];
}

const mapColumnsToColumnOptionCollection = (columns: Column<BoxRow>[]) =>
  columns
    .map((column) => ({
      label: column.Header?.toString() || "",
      value: column.accessor?.toString() || "",
    }))
    .filter((value) => value !== undefined);

const ColumnSelector = ({
  availableColumns,
  setSelectedColumns,
  selectedColumns,
}: ColumnSelectorProps) => {
  const allAvailableColumnOptions = useMemo(
    () => mapColumnsToColumnOptionCollection(availableColumns),
    [availableColumns]
  );

  const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const columnId = e.target.value;
    debugger;
    const column = availableColumns.find((column) => column.id === columnId);
    if (column != null) {
      if (checked) {
        setSelectedColumns(
          selectedColumns.includes(column)
            ? selectedColumns
            : [...selectedColumns, column]
        );
      } else {
        setSelectedColumns(selectedColumns.filter((c) => c !== column));
      }
    }
  };

  const selectedColumnOptions =
    mapColumnsToColumnOptionCollection(selectedColumns);

  return (
    <Box maxW="400px" minW="250px">
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Columns
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex flexWrap="wrap">
              {allAvailableColumnOptions.map((columnOption) => (
                <Checkbox
                  m={1}
                  py={1}
                  px={2}
                  border="1px"
                  colorScheme="gray"
                  borderColor="gray.200"
                  onChange={onCheckboxChange}
                  key={columnOption.value}
                  defaultChecked={selectedColumnOptions
                    .map((c) => c.value)
                    .includes(columnOption.value)}
                  value={columnOption.value}
                >
                  {columnOption.label}
                </Checkbox>
              ))}
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

const BoxesTable = ({ tableData, onBoxRowClick }: BoxesTableProps) => {
  const availableColumns: Column<BoxRow>[] = React.useMemo(
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
        Header: "Place",
        accessor: "place",
        id: "place",
        Filter: SelectColumnFilter,
        filter: "equals",
      },
      {
        Header: "Tags",
        accessor: "tags",
        id: "tags",
        Filter: SelectColumnFilter,
        filter: "equals",
      },
    ],
    []
  );

  const [selectedColumns, setSelectedColumns] =
    React.useState<Column<BoxRow>[]>(availableColumns);
  const orderedSelectedColumns = useMemo(
    () =>
      selectedColumns.sort(
        (a, b) => availableColumns.indexOf(a) - availableColumns.indexOf(b)
      ),
    [selectedColumns, availableColumns]
  );

  return (
    <>
      <ColumnSelector
        availableColumns={availableColumns}
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
      />
      <ActualTable
        columns={orderedSelectedColumns}
        tableData={tableData}
        onBoxRowClick={onBoxRowClick}
      />
      ;
    </>
  );
};

interface ActualTableProps {
  columns: Column<BoxRow>[];
  show?: boolean;
  tableData: BoxRow[];
  onBoxRowClick: (labelIdentified: string) => void;
}
const ActualTable = ({
  show = true,
  columns,
  tableData,
  onBoxRowClick,
}: ActualTableProps) => {
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
  // TODO: remove this ts-ignore again and try to fix the type error properly
  // was most likely caused by setting one of the following flags in .tsconfig:
  // "strictNullChecks": true
  // "strictFunctionTypes": false
    {
  // @ts-ignore
      columns,
      data: tableData,
      initialState: {
        pageIndex: 0,
        pageSize: 20,
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

  const [filterActive, setFilterActive] = useState(false);

  if (!show) {
    return <></>;
  }

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
              <Button m={2} key={column.id} borderRadius='0px'>
                <label htmlFor={column.id}>{column.render("Header")}</label>
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
                <Th {...column.getHeaderProps(column.getSortByToggleProps())} title={`Toggle SortBy for '${column.render("Header")}'`}>
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
                onClick={() => onBoxRowClick(row.original['labelIdentifier'])}
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
