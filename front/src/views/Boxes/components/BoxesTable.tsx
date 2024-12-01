import React, { useEffect, useMemo, useTransition } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import {
  Skeleton,
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
  CellProps,
} from "react-table";
import { FilteringSortingTableHeader } from "components/Table/TableHeader";
import { QueryRef, useReadQuery } from "@apollo/client";
import {
  includesOneOfMultipleStringsFilterFn,
  includesSomeObjectFilterFn,
} from "components/Table/Filter";
import { IUseTableConfigReturnType } from "hooks/hooks";
import IndeterminateCheckbox from "./Checkbox";
import { GlobalFilter } from "./GlobalFilter";
import { BoxRow } from "./types";
import {
  boxesRawDataToTableDataTransformer,
  prepareBoxesForBoxesViewQueryVariables,
} from "./transformers";
import ColumnSelector from "./ColumnSelector";
import { useBaseIdParam } from "hooks/useBaseIdParam";
import { BoxesForBoxesViewVariables, BoxesForBoxesViewQuery } from "queries/types";

interface IBoxesTableProps {
  tableConfig: IUseTableConfigReturnType;
  onRefetch: (variables?: BoxesForBoxesViewVariables) => void;
  boxesQueryRef: QueryRef<BoxesForBoxesViewQuery>;
  columns: Column<BoxRow>[];
  actionButtons: React.ReactNode[];
  onBoxRowClick: (labelIdentified: string) => void;
  setSelectedBoxes: (rows: Row<BoxRow>[]) => void;
  selectedRowsArePending: boolean;
}

function BoxesTable({
  tableConfig,
  onRefetch,
  boxesQueryRef,
  columns,
  actionButtons,
  onBoxRowClick,
  setSelectedBoxes,
  selectedRowsArePending,
}: IBoxesTableProps) {
  const { baseId } = useBaseIdParam();
  const [refetchBoxesIsPending, startRefetchBoxes] = useTransition();
  const { data: rawData } = useReadQuery(boxesQueryRef);
  const tableData = useMemo(() => boxesRawDataToTableDataTransformer(rawData), [rawData]);

  // Add custom filter function to filter objects in a column
  // https://react-table-v7.tanstack.com/docs/examples/filtering
  const filterTypes = useMemo(
    () => ({
      includesSomeObject: includesSomeObjectFilterFn,
      includesOneOfMultipleStrings: includesOneOfMultipleStringsFilterFn,
    }),
    [],
  );

  const {
    headerGroups,
    prepareRow,
    allColumns,
    state: { globalFilter, pageIndex, filters, sortBy, hiddenColumns },
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
        hiddenColumns: tableConfig.getHiddenColumns(),
        sortBy: tableConfig.getSortBy(),
        pageIndex: 0,
        pageSize: 20,
        filters: tableConfig.getColumnFilters(),
        ...(tableConfig.getGlobalFilter()
          ? { globalFilter: tableConfig.getGlobalFilter() }
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
          Header: ({ getToggleAllPageRowsSelectedProps }: CellProps<any, any>) => (
            <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
          ),
          Cell: ({ row }: CellProps<any, any>) => (
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          ),
        },
        ...col,
      ]);
    },
  );

  useEffect(() => {
    setSelectedBoxes(selectedFlatRows.map((row) => row));
  }, [selectedFlatRows, setSelectedBoxes]);

  useEffect(() => {
    // refetch
    const newStateFilter = filters.find((filter) => filter.id === "state");
    const oldStateFilter = tableConfig.getColumnFilters().find((filter) => filter.id === "state");
    if (newStateFilter !== oldStateFilter) {
      startRefetchBoxes(() => {
        onRefetch(prepareBoxesForBoxesViewQueryVariables(baseId, filters));
      });
    }

    // update tableConfig
    if (globalFilter !== tableConfig.getGlobalFilter()) {
      tableConfig.setGlobalFilter(globalFilter);
    }
    if (filters !== tableConfig.getColumnFilters()) {
      tableConfig.setColumnFilters(filters);
    }
    if (sortBy !== tableConfig.getSortBy()) {
      tableConfig.setSortBy(sortBy);
    }
    if (hiddenColumns !== tableConfig.getHiddenColumns()) {
      tableConfig.setHiddenColumns(hiddenColumns);
    }
  }, [baseId, filters, globalFilter, hiddenColumns, onRefetch, sortBy, tableConfig]);

  return (
    <Flex direction="column" height="100%">
      <Flex alignItems="center" flexWrap="wrap" key="columnSelector" flex="none">
        <ButtonGroup mb={2}>{actionButtons}</ButtonGroup>
        <Spacer />
        <HStack spacing={2} mb={2}>
          <ColumnSelector availableColumns={allColumns} />
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
            {refetchBoxesIsPending && (
              <Tr key="refetchIsPending1">
                <Td colSpan={columns.length + 1}>
                  <Skeleton height={5} />
                </Td>
              </Tr>
            )}
            {refetchBoxesIsPending && (
              <Tr key="refetchIsPending2">
                <Td colSpan={columns.length + 1}>
                  <Skeleton height={5} />
                </Td>
              </Tr>
            )}
            {page.map((row) => {
              prepareRow(row);
              if (row.isSelected && selectedRowsArePending) {
                return (
                  <Tr key={row.original.labelIdentifier}>
                    <Td colSpan={columns.length + 1}>
                      <Skeleton height={5} />
                    </Td>
                  </Tr>
                );
              }
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
