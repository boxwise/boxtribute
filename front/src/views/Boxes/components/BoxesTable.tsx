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
  HStack,
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
import { useAtomValue } from "jotai";
import { QueryRef, useReadQuery } from "@apollo/client";
import {
  includesOneOfMultipleStringsFilterFn,
  includesSomeObjectFilterFn,
  includesSomeTagObjectFilterFn,
} from "components/Table/Filter";
import { IUseTableConfigReturnType } from "hooks/hooks";
import IndeterminateCheckbox from "./Checkbox";
import { GlobalFilter } from "./GlobalFilter";
import { BoxRow } from "./types";
import {
  boxesRawDataToTableDataTransformer,
  prepareBoxesForBoxesViewQueryVariables,
} from "./transformers";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { BoxesForBoxesViewVariables, BoxesForBoxesViewQuery } from "queries/types";
import ColumnSelector from "components/Table/ColumnSelector";
import useBoxesActions from "../hooks/useBoxesActions";
import BoxesActions from "./BoxesActions";

interface IBoxesTableProps {
  isBackgroundFetchOfBoxesLoading: boolean;
  tableConfig: IUseTableConfigReturnType;
  onRefetch: (variables?: BoxesForBoxesViewVariables) => void;
  boxesQueryRef: QueryRef<BoxesForBoxesViewQuery>;
  columns: Column<BoxRow>[];
  locationOptions: { label: string; value: string }[];
  actionButtons?: React.ReactNode[];
  selectedBoxes: Row<BoxRow>[];
  setSelectedBoxes: (rows: Row<BoxRow>[]) => void;
  selectedRowsArePending: boolean;
}

function BoxesTable({
  isBackgroundFetchOfBoxesLoading,
  tableConfig,
  onRefetch,
  boxesQueryRef,
  columns,
  locationOptions,
  selectedBoxes,
  setSelectedBoxes,
  selectedRowsArePending,
}: IBoxesTableProps) {
  const baseId = useAtomValue(selectedBaseIdAtom);
  const [refetchBoxesIsPending, startRefetchBoxes] = useTransition();
  const { data: rawData } = useReadQuery(boxesQueryRef);
  const tableData = useMemo(() => boxesRawDataToTableDataTransformer(rawData), [rawData]);

  // Add custom filter function to filter objects in a column
  // https://react-table-v7.tanstack.com/docs/examples/filtering
  const filterTypes = useMemo(
    () => ({
      includesSomeObject: includesSomeObjectFilterFn,
      includesOneOfMultipleStrings: includesOneOfMultipleStringsFilterFn,
      includesSomeTagObject: includesSomeTagObjectFilterFn,
    }),
    [],
  );

  const selectedRowIds = useMemo(() => {
    return selectedBoxes.reduce(
      (acc, row) => {
        acc[row.id] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }, [selectedBoxes]);

  const {
    headerGroups,
    prepareRow,
    allColumns,
    state: { globalFilter, pageIndex, filters, sortBy, hiddenColumns },
    setGlobalFilter,
    page,
    rows,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    selectedFlatRows,
  } = useTable(
    {
      columns,
      data: tableData,
      filterTypes,
      initialState: {
        selectedRowIds: selectedRowIds,
        hiddenColumns: tableConfig.getHiddenColumns(),
        sortBy: tableConfig.getSortBy(),
        pageIndex: 0,
        pageSize: 20,
        filters: tableConfig.getColumnFilters(),
        ...(tableConfig.getGlobalFilter()
          ? { globalFilter: tableConfig.getGlobalFilter() }
          : undefined),
      },
      autoResetSelectedRows: false,
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
  const boxCount = rows.length;
  const itemsCount = rows.reduce((total, row) => total + row.original.numberOfItems, 0);

  useEffect(() => {
    setSelectedBoxes(selectedFlatRows.map((row) => row));
  }, [selectedFlatRows, setSelectedBoxes]);

  const { onBoxRowClick, onMoveBoxes, actionsAreLoading } = useBoxesActions(selectedFlatRows);

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
        <BoxesActions
          onMoveBoxes={onMoveBoxes}
          locationOptions={locationOptions}
          actionsAreLoading={actionsAreLoading}
        />
        <Spacer />
        <HStack spacing={2} mb={2}>
          <ColumnSelector
            availableColumns={allColumns.filter(
              (column) => column.id !== "shipment" && column.id !== "selection",
            )}
          />
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
        </HStack>
      </Flex>
      <Table key="boxes-table">
        <FilteringSortingTableHeader headerGroups={headerGroups} />
        <Tbody>
          <Tr key={"boxes-count-row"}>
            <Td fontWeight="bold" key={"product-total"}>
              Total
            </Td>
            <Td fontWeight="bold" key={"boxes-count"}>
              {isBackgroundFetchOfBoxesLoading || refetchBoxesIsPending ? (
                <Skeleton height={5} width={10} mr={2} />
              ) : (
                <Text as="span">{boxCount} boxes</Text>
              )}
            </Td>
            <Td fontWeight="bold" key={"item-count"}>
              {isBackgroundFetchOfBoxesLoading || refetchBoxesIsPending ? (
                <Skeleton height={5} width={10} mr={2} />
              ) : (
                <Text as="span">{itemsCount} items</Text>
              )}
            </Td>
          </Tr>
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
          <Text as="span">
            Page{" "}
            <Text fontWeight="bold" as="span">
              {pageIndex + 1}
            </Text>{" "}
            of{" "}
          </Text>
          {isBackgroundFetchOfBoxesLoading || refetchBoxesIsPending ? (
            <Skeleton height={5} width={10} mr={2} />
          ) : (
            <Text fontWeight="bold" as="span">
              {pageOptions.length}
            </Text>
          )}
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
