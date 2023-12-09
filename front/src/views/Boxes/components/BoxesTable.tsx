import React, { useEffect, useMemo } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import {
  Table,
  Tr,
  Tbody,
  Td,
  Spacer,
  Flex,
  Text,
  IconButton,
  ButtonGroup,
  HStack,
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
  Row,
  Filters,
} from "react-table";
import { FilteringSortingTableHeader } from "components/Table/TableHeader";
import { tableConfigsVar } from "queries/cache";
import { QueryReference, useReactiveVar, useReadQuery } from "@apollo/client";
import {
  includesOneOfMulipleStringsFilterFn,
  includesSomeObjectFilterFn,
} from "components/Table/Filter";
import { BoxesForBoxesViewQuery } from "types/generated/graphql";
import IndeterminateCheckbox from "./Checkbox";
import { GlobalFilter } from "./GlobalFilter";
import { BoxRow } from "./types";
import { boxesRawDataToTableDataTransformer } from "./transformers";

interface IBoxesTableProps {
  boxesQueryRef: QueryReference<BoxesForBoxesViewQuery>;
  refetchBoxesIsPending: boolean;
  onRefetchBoxes: () => void;
  tableConfigKey: string;
  columns: Column<BoxRow>[];
  actionButtons: React.ReactNode[];
  columnSelector: React.ReactNode;
  onBoxRowClick: (labelIdentified: string) => void;
  setSelectedBoxes: (rows: Row<BoxRow>[]) => void;
}

function BoxesTable({
  boxesQueryRef,
  refetchBoxesIsPending,
  onRefetchBoxes,
  tableConfigKey,
  columns,
  actionButtons,
  columnSelector,
  onBoxRowClick,
  setSelectedBoxes,
}: IBoxesTableProps) {
  const { data: rawData } = useReadQuery<BoxesForBoxesViewQuery>(boxesQueryRef);
  const tableData = useMemo(() => boxesRawDataToTableDataTransformer(rawData), [rawData]);

  const tableConfigsState = useReactiveVar(tableConfigsVar);
  const tableConfig = tableConfigsState?.get(tableConfigKey);
  if (tableConfig == null) {
    tableConfigsState.set(tableConfigKey, {
      globalFilter: undefined,
      columnFilters: [],
    });
    tableConfigsVar(tableConfigsState);
  }

  // Add custom filter function to filter objects in a column
  // https://react-table-v7.tanstack.com/docs/examples/filtering
  const filterTypes = useMemo(
    () => ({
      includesSomeObject: includesSomeObjectFilterFn,
      includesOneOfMulipleStrings: includesOneOfMulipleStringsFilterFn,
    }),
    [],
  );

  // only set default filter to instock if there is at least one instock box
  const columnFiltersDefault: Filters<any> = useMemo(() => {
    if (tableConfig?.columnFilters) {
      return tableConfig.columnFilters;
    }
    const hasInStockBox = tableData.some((box) => box.state === "InStock");
    if (hasInStockBox) {
      return [{ id: "state", value: ["InStock"] }];
    }
    return [];
  }, [tableConfig?.columnFilters, tableData]);

  const {
    headerGroups,
    prepareRow,
    state: { globalFilter, pageIndex, filters },
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
      filterTypes,
      initialState: {
        pageIndex: 0,
        pageSize: 20,
        filters: columnFiltersDefault,
        ...(tableConfig?.globalFilter != null
          ? { globalFilter: tableConfig?.globalFilter }
          : undefined),
      },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((col) => [
        {
          id: "selection",
          // eslint-disable-next-line react/no-unstable-nested-components
          Header: ({ getToggleAllPageRowsSelectedProps }) => (
            <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
          ),
          // eslint-disable-next-line react/no-unstable-nested-components
          Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
        },
        ...col,
      ]);
    },
  );

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(filters);
    // if filters
    // onRefetchBoxes();
  }, [filters]);

  useEffect(() => {
    setSelectedBoxes(selectedFlatRows.map((row) => row));
  }, [selectedFlatRows, setSelectedBoxes]);

  useEffect(() => {
    tableConfigsState.set(tableConfigKey, {
      globalFilter,
      columnFilters: filters,
    });
    tableConfigsVar(tableConfigsState);
  }, [globalFilter, filters, tableConfig, tableConfigsState, tableConfigKey]);

  return (
    <Flex direction="column" height="100%">
      <Flex alignItems="center" flexWrap="wrap" key="columnSelector" flex="none">
        <ButtonGroup mb={2}>{actionButtons}</ButtonGroup>
        <Spacer />
        <HStack spacing={2} mb={2}>
          {columnSelector}
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
        </HStack>
      </Flex>
      {/*
      see https://chakra-ui.com/docs/components/table/usage#table-container
      I added overflowY and flex={1} to make the table scrollable vertically scrollable and
      took the other settings from <TableContainer>
      */}
      <Box
        flex={1}
        display="block"
        maxWidth="100%"
        overflowX="auto"
        overflowY="auto"
        whiteSpace="nowrap"
      >
        <Table key="boxes-table">
          <FilteringSortingTableHeader headerGroups={headerGroups} />
          <Tbody>
            {page.map((row) => {
              prepareRow(row);
              return (
                <Tr
                  cursor="pointer"
                  {...row.getRowProps()}
                  onClick={() => onBoxRowClick(row.original.labelIdentifier)}
                  key={row.original.labelIdentifier}
                >
                  {row.cells.map((cell) => (
                    <Td key={`${row.original.labelIdentifier}-${cell.column.id}`}>
                      {cell.render("Cell")}
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
      <Flex justifyContent="center" alignItems="center" key="pagination" flex="none">
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
    </Flex>
  );
}

export default BoxesTable;
