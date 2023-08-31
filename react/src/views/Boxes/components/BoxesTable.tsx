import React, { useEffect, useMemo, useState } from "react";
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
  ButtonGroup,
} from "@chakra-ui/react";
import {
  Column,
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useRowSelect,
  usePagination,
  Row,
} from "react-table";
import { BoxRow } from "./types";
import { GlobalFilter } from "./GlobalFilter";
import { SelectColumnFilter } from "components/Table/Filter";
import IndeterminateCheckbox from "./Checkbox";
import { FilteringSortingTableHeader } from "components/Table/TableHeader";
import { useMoveBoxes } from "hooks/useMoveBoxes";
import { SelectButton } from "./ActionButtons";

export type BoxesTableProps = {
  tableData: BoxRow[];
  locationOptions: { label: string; value: string }[];
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
    [availableColumns],
  );

  const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const columnId = e.target.value;
    const column = availableColumns.find((column) => column.id === columnId);
    if (column != null) {
      if (checked) {
        setSelectedColumns(
          selectedColumns.includes(column) ? selectedColumns : [...selectedColumns, column],
        );
      } else {
        setSelectedColumns(selectedColumns.filter((c) => c !== column));
      }
    }
  };

  const selectedColumnOptions = mapColumnsToColumnOptionCollection(selectedColumns);

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

const BoxesTable = ({ tableData, locationOptions, onBoxRowClick }: BoxesTableProps) => {
  const availableColumns: Column<BoxRow>[] = React.useMemo(
    () => [
      {
        Header: "Product",
        accessor: "productName",
        id: "productName",
        Filter: SelectColumnFilter,
        filter: "includesSome",
        // disableGlobalFilter: true,
      },
      {
        Header: "Box Number",
        accessor: "labelIdentifier",
        id: "labelIdentifier",
        disableFilters: true,
        // disableGlobalFilter: true,
      },
      {
        Header: "Gender",
        accessor: "gender",
        id: "gender",
        // disableFilters: false,
        Filter: SelectColumnFilter,
        filter: "includesSome",
        // disableGlobalFilter: true,
      },
      {
        Header: "Size",
        accessor: "size",
        id: "size",
        Filter: SelectColumnFilter,
        filter: "includesSome",
        // disableGlobalFilter: true,
      },
      {
        Header: "Items",
        accessor: "numberOfItems",
        id: "numberOfItems",
        disableFilters: true,
        // disableGlobalFilter: true,
      },
      {
        Header: "State",
        accessor: "state",
        id: "state",
        Filter: SelectColumnFilter,
        filter: "includesSome",
        // disableGlobalFilter: true,
      },
      {
        Header: "Place",
        accessor: "place",
        id: "place",
        Filter: SelectColumnFilter,
        filter: "includesSome",
        // disableGlobalFilter: true,
      },
      {
        Header: "Tags",
        accessor: "tags",
        id: "tags",
        Filter: SelectColumnFilter,
        filter: "includesSome",
        // disableGlobalFilter: true,
      },
    ],
    [],
  );

  const [selectedColumns, setSelectedColumns] = useState<Column<BoxRow>[]>(availableColumns);
  const orderedSelectedColumns = useMemo(
    () => selectedColumns.sort((a, b) => availableColumns.indexOf(a) - availableColumns.indexOf(b)),
    [selectedColumns, availableColumns],
  );

  // Actions on Selected Boxes
  const [selectedBoxes, setSelectedBoxes] = useState<Row<object>[]>([]);
  // Move Boxes
  const { isLoading: moveBoxesIsLoading, moveBoxes } = useMoveBoxes();

  return (
    <>
      <ColumnSelector
        availableColumns={availableColumns}
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
      />
      <ButtonGroup>
        <SelectButton
          label="Move Boxes"
          options={locationOptions}
          onSelect={(value: string) => {}}
        />
      </ButtonGroup>
      <ActualTable
        columns={orderedSelectedColumns}
        tableData={tableData}
        onBoxRowClick={onBoxRowClick}
        onSelectedRowsChange={setSelectedBoxes}
      />
      ;
    </>
  );
};

interface IActualTableProps {
  columns: Column<BoxRow>[];
  show?: boolean;
  tableData: BoxRow[];
  onBoxRowClick: (labelIdentified: string) => void;
  onSelectedRowsChange: (selectedRows: Row<object>[]) => void;
}
const ActualTable = ({
  show = true,
  columns,
  tableData,
  onBoxRowClick,
  onSelectedRowsChange,
}: IActualTableProps) => {
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
    selectedFlatRows,
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
    },
  );

  // Update selected rows
  useEffect(() => {
    onSelectedRowsChange(selectedFlatRows);
  }, [onSelectedRowsChange, selectedFlatRows]);

  if (!show) {
    return <></>;
  }

  return (
    <>
      <Flex alignItems="center" flexWrap="wrap">
        <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
      </Flex>

      <Table>
        <FilteringSortingTableHeader headerGroups={headerGroups} />
        <Tbody>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <Tr
                cursor="pointer"
                {...row.getRowProps()}
                onClick={() => onBoxRowClick(row.original["labelIdentifier"])}
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
