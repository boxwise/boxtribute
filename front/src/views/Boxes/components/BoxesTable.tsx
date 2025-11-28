import { useEffect, useMemo, useTransition } from "react";
import { IoChevronForward, IoChevronBack } from "react-icons/io5";
import { Skeleton, Table, Spacer, Flex, Text, IconButton, HStack, Box } from "@chakra-ui/react";
import {
  Column,
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useRowSelect,
  usePagination,
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
import { IUseTableConfigReturnType } from "hooks/useTableConfig";
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
import { IDropdownOption } from "components/Form/SelectField";

interface IBoxesTableProps {
  isBackgroundFetchOfBoxesLoading: boolean;
  hasExecutedInitialFetchOfBoxes: { current: boolean };
  tableConfig: IUseTableConfigReturnType;
  onRefetch: (variables?: BoxesForBoxesViewVariables) => void;
  boxesQueryRef: QueryRef<BoxesForBoxesViewQuery>;
  columns: Column<BoxRow>[];
  locationOptions: { label: string; value: string }[];
  tagOptions: IDropdownOption[];
  shipmentOptions: { label: string; value: string }[];
}

function BoxesTable({
  isBackgroundFetchOfBoxesLoading,
  hasExecutedInitialFetchOfBoxes,
  tableConfig,
  onRefetch,
  boxesQueryRef,
  columns,
  locationOptions,
  tagOptions,
  shipmentOptions,
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
    toggleRowSelected,
  } = useTable(
    {
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
      autoResetSelectedRows: !isBackgroundFetchOfBoxesLoading,
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
  const selectedCount = selectedFlatRows.length;

  const {
    onBoxRowClick,
    onMoveBoxes,
    onDeleteBoxes,
    onAssignTags,
    onUnassignTags,
    onAssignBoxesToShipment,
    onUnassignBoxesToShipment,
    actionsAreLoading,
  } = useBoxesActions(selectedFlatRows, toggleRowSelected);

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
          selectedBoxes={selectedFlatRows}
          onMoveBoxes={onMoveBoxes}
          locationOptions={locationOptions}
          onDeleteBoxes={onDeleteBoxes}
          onAssignTags={onAssignTags}
          onUnassignTags={onUnassignTags}
          tagOptions={tagOptions}
          onAssignBoxesToShipment={onAssignBoxesToShipment}
          shipmentOptions={shipmentOptions}
          onUnassignBoxesToShipment={onUnassignBoxesToShipment}
          actionsAreLoading={actionsAreLoading}
        />
        <Spacer />
        <HStack gap={2} mb={2}>
          <ColumnSelector
            availableColumns={allColumns.filter(
              (column) => column.id !== "shipment" && column.id !== "selection",
            )}
          />
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
        </HStack>
      </Flex>
      <Table.Root key="boxes-table">
        <FilteringSortingTableHeader headerGroups={headerGroups} />
        <Table.Body>
          <Table.Row key={"boxes-count-row"} bg={"gray.100"}>
            <Table.Cell fontWeight="bold" key={"product-total"}>
              Total
            </Table.Cell>
            <Table.Cell fontWeight="bold" key={"boxes-count"}>
              {isBackgroundFetchOfBoxesLoading ||
              refetchBoxesIsPending ||
              tableConfig.isNotMounted ? (
                <Skeleton height={5} width={10} mr={2} />
              ) : hasExecutedInitialFetchOfBoxes.current ? (
                <Text as="span">{boxCount} boxes</Text>
              ) : (
                <Text as="span">Data unavailable</Text>
              )}
            </Table.Cell>
            <Table.Cell fontWeight="bold" key={"item-count"}>
              {isBackgroundFetchOfBoxesLoading ||
              refetchBoxesIsPending ||
              tableConfig.isNotMounted ? (
                <Skeleton height={5} width={10} mr={2} />
              ) : hasExecutedInitialFetchOfBoxes.current ? (
                <Text as="span">{itemsCount} items</Text>
              ) : (
                <Text as="span">Data unavailable</Text>
              )}
            </Table.Cell>
            <Table.Cell colSpan={20}></Table.Cell>
          </Table.Row>
          {(refetchBoxesIsPending || tableConfig.isNotMounted) && (
            <Table.Row key="refetchIsPending1">
              <Table.Cell colSpan={columns.length + 1}>
                <Skeleton height={5} />
              </Table.Cell>
            </Table.Row>
          )}
          {(refetchBoxesIsPending || tableConfig.isNotMounted) && (
            <Table.Row key="refetchIsPending2">
              <Table.Cell colSpan={columns.length + 1}>
                <Skeleton height={5} />
              </Table.Cell>
            </Table.Row>
          )}

          {page.map((row) => {
            prepareRow(row);
            if (row.isSelected && actionsAreLoading) {
              return (
                <Table.Row key={row.original.labelIdentifier}>
                  <Table.Cell colSpan={columns.length + 1}>
                    <Skeleton height={5} />
                  </Table.Cell>
                </Table.Row>
              );
            }

            return (
              <Table.Row
                cursor="pointer"
                {...row.getRowProps()}
                onClick={() => onBoxRowClick(row.original.labelIdentifier)}
                key={row.original.labelIdentifier}
              >
                {row.cells.map((cell) => (
                  <Table.Cell key={`${row.original.labelIdentifier}-${cell.column.id}`}>
                    {cell.render("Cell")}
                  </Table.Cell>
                ))}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
      <Flex justifyContent="center" alignItems="center" key="pagination" flex="none">
        <Flex>
          <IconButton aria-label="Previous Page" onClick={previousPage} disabled={!canPreviousPage}>
            <IoChevronBack size={24} />
          </IconButton>
        </Flex>

        <Flex justifyContent="center" m={4}>
          <Text as="span">
            Page{" "}
            <Text fontWeight="bold" as="span">
              {pageIndex + 1}
            </Text>{" "}
            of{" "}
            {isBackgroundFetchOfBoxesLoading || refetchBoxesIsPending ? (
              <Skeleton height={5} width={10} mr={2} />
            ) : (
              <Text fontWeight="bold" as="span">
                {pageOptions.length}
              </Text>
            )}
          </Text>
        </Flex>

        <Flex>
          <IconButton aria-label="Next Page" onClick={nextPage} disabled={!canNextPage}>
            <IoChevronForward size={24} />
          </IconButton>
        </Flex>
      </Flex>

      {/* Floating selected boxes counter */}
      {selectedCount > 0 && (
        <Box
          position="fixed"
          bottom={9}
          right={4}
          bg="blue.600"
          color="white"
          px={4}
          py={2}
          borderRadius="md"
          boxShadow="lg"
          zIndex={1000}
          data-testid="floating-selected-counter"
        >
          <Text fontSize="sm" fontWeight="bold">
            {selectedCount === 1 ? "one box selected" : `${selectedCount} boxes selected`}
          </Text>
        </Box>
      )}
    </Flex>
  );
}

export default BoxesTable;
