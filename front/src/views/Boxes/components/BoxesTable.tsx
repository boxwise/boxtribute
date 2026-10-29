import { useEffect, useMemo, useCallback, useRef, useState } from "react";
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
  Box,
  useDisclosure,
} from "@chakra-ui/react";
import {
  Column,
  useTable,
  useFilters,
  useSortBy,
  useRowSelect,
  usePagination,
  CellProps,
  Filters,
  HeaderGroup,
  TableState,
} from "react-table";
import { FilteringSortingTableHeader } from "components/Table/TableHeader";
import { IUseTableConfigReturnType } from "hooks/useTableConfig";
import IndeterminateCheckbox from "./Checkbox";
import { BoxRow } from "./types";
import { boxesRawDataToTableDataTransformer } from "./transformers";
import { ActionOptionsForBoxesViewQuery } from "queries/types";
import ColumnSelector from "components/Table/ColumnSelector";
import { GlobalFilter } from "components/Table/GlobalFilter";
import useBoxesActions from "../hooks/useBoxesActions";
import { useBoxRows } from "../hooks/useBoxRows";
import { useBoxesViewUrlState } from "../hooks/useBoxesViewUrlState";
import {
  COLUMN_ID_TO_SORT_BY,
  PAGE_SIZE,
  SORT_BY_TO_COLUMN_ID,
  getNextSort,
} from "../boxesViewUrlState";
import BoxesActions from "./BoxesActions";
import { IDropdownOption } from "components/Form/SelectField";
import { BoxesFilter } from "./BoxesFilter";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import { FilterChips } from "./FilterChips";
import { FilterPanel } from "@boxtribute/shared-components/filter/FilterPanel";
import { removeFilter, formatWeight, formatMonetaryValue } from "utils/helpers";
import { useAuthorization } from "hooks/useAuthorization";

interface IBoxesTableProps {
  baseId: string;
  /** The state of the view derived from the URL */
  urlState: ReturnType<typeof useBoxesViewUrlState>;
  tableConfig: IUseTableConfigReturnType;
  actionOptionsData: ActionOptionsForBoxesViewQuery;
  columns: Column<BoxRow>[];
  locationOptions: IFilterValue[];
  tagOptions: IFilterValue[];
  shipmentOptions: IDropdownOption[];
  productOptions: IFilterValue[];
  categoryOptions: IFilterValue[];
  genderOptions: IFilterValue[];
  sizeOptions: IFilterValue[];
}

function BoxesTable({
  baseId,
  urlState,
  tableConfig,
  actionOptionsData,
  columns,
  locationOptions,
  tagOptions,
  shipmentOptions,
  productOptions,
  categoryOptions,
  genderOptions,
  sizeOptions,
}: IBoxesTableProps) {
  const authorize = useAuthorization();
  const showWeightAndValue = authorize({ minBeta: 7 });
  const {
    filters,
    search,
    sortBy,
    descending,
    page: currentPage,
    filterBoxInput,
    setFilters,
    setSearch,
    setSort,
    setPage,
  } = urlState;

  const { rows, totals, maxPage, isLoading, isPrefetching, isRefetching, refetch } = useBoxRows({
    baseId,
    filters,
    search,
    sortBy,
    descending,
    page: currentPage,
  });

  const tableData = useMemo(
    () => boxesRawDataToTableDataTransformer({ page: rows }, actionOptionsData),
    [rows, actionOptionsData],
  );

  // Filters, sorting and pagination are controlled by the URL, not by react-table
  const controlledSortBy = useMemo(
    () => (sortBy ? [{ id: SORT_BY_TO_COLUMN_ID[sortBy], desc: descending }] : []),
    [sortBy, descending],
  );
  const useControlledState = useCallback(
    (state: TableState<BoxRow>): TableState<BoxRow> => ({
      ...state,
      filters,
      sortBy: controlledSortBy,
      pageIndex: currentPage - 1,
      pageSize: PAGE_SIZE,
    }),
    [filters, controlledSortBy, currentPage],
  );

  // Select-all: all boxes matching the filters of the view are selected, including the ones that
  // are not loaded. Row selection by the user turns it off.
  const [isSelectAll, setIsSelectAll] = useState(false);
  const isSelectAllRef = useRef(isSelectAll);
  isSelectAllRef.current = isSelectAll;

  const {
    headerGroups,
    prepareRow,
    allColumns,
    state: { hiddenColumns },
    page,
    selectedFlatRows,
    toggleAllRowsSelected,
    dispatch,
  } = useTable<BoxRow>(
    {
      columns,
      data: tableData,
      getRowId: (row) => row.labelIdentifier,
      initialState: {
        hiddenColumns: tableConfig.getHiddenColumns(),
      },
      manualPagination: true,
      manualFilters: true,
      manualSortBy: true,
      disableMultiSort: true,
      autoResetPage: false,
      autoResetFilters: false,
      autoResetSortBy: false,
      autoResetSelectedRows: false,
      pageCount: maxPage,
      useControlledState,
    },
    useFilters,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((col) => [
        {
          id: "selection",
          Header: ({ getToggleAllPageRowsSelectedProps }: CellProps<any, any>) => {
            const props = getToggleAllPageRowsSelectedProps();
            return (
              <IndeterminateCheckbox
                {...props}
                onChange={(e) => {
                  setIsSelectAll(false);
                  props.onChange?.(e);
                }}
              />
            );
          },
          Cell: ({ row }: CellProps<any, any>) => {
            const props = row.getToggleRowSelectedProps();
            return (
              <IndeterminateCheckbox
                {...props}
                onChange={(e) => {
                  setIsSelectAll(false);
                  props.onChange?.(e);
                }}
              />
            );
          },
        },
        ...col,
      ]);
    },
  );
  const totalNumberOfBoxes = totals?.totalNumberOfBoxes ?? 0;
  const selectedCount = isSelectAll ? totalNumberOfBoxes : selectedFlatRows.length;
  const weightUnit = tableData.find((row) => row.weightUnitSymbol)?.weightUnitSymbol ?? null;
  const currency = actionOptionsData.base?.monetaryCurrencyCode ?? null;

  // toggleAllRowsSelected(false) only deselects the rows that are currently loaded
  const resetSelectedRows = useCallback(() => dispatch({ type: "resetSelectedRows" }), [dispatch]);

  const resetSelection = useCallback(() => {
    setIsSelectAll(false);
    resetSelectedRows();
  }, [resetSelectedRows]);

  // The boxes found by the backend for select-all are restricted to the locations of the base,
  // unless the filters specify locations. Otherwise, boxes of other bases that the user has access
  // to would be affected as well.
  const baseLocations = actionOptionsData.base?.locations;
  const baseLocationIds = useMemo(
    () => baseLocations?.map(({ id }) => Number(id)),
    [baseLocations],
  );
  const selectAll = useMemo(
    () =>
      isSelectAll
        ? {
            filters: {
              ...filterBoxInput,
              locationIds: filterBoxInput.locationIds ?? baseLocationIds,
            },
            onDone: resetSelection,
          }
        : undefined,
    [isSelectAll, filterBoxInput, baseLocationIds, resetSelection],
  );

  const {
    onBoxRowClick,
    onMoveBoxes,
    onDeleteBoxes,
    onAssignTags,
    onUnassignTags,
    onAssignBoxesToShipment,
    onUnassignBoxesToShipment,
    actionsAreLoading,
  } = useBoxesActions(selectedFlatRows, refetch, selectAll);

  // Select-all and the row selection are reset when the boxes of the view change
  const viewKey = JSON.stringify([baseId, filters, search, sortBy, descending]);
  useEffect(() => {
    resetSelection();
  }, [viewKey, resetSelection]);

  // The row selection is limited to the current page, unless select-all is active. In that case,
  // the rows of the new page are selected once they are loaded.
  useEffect(() => {
    if (!isSelectAllRef.current) {
      resetSelectedRows();
    }
  }, [currentPage, resetSelectedRows]);
  useEffect(() => {
    if (isSelectAll) {
      toggleAllRowsSelected(true);
    }
  }, [isSelectAll, tableData, toggleAllRowsSelected]);

  // Only the hidden columns are persisted in the table config
  useEffect(() => {
    if (hiddenColumns !== tableConfig.getHiddenColumns()) {
      tableConfig.setHiddenColumns(hiddenColumns);
    }
  }, [hiddenColumns, tableConfig]);

  // Correct a page that is out of range, e.g. because of a manually edited URL
  useEffect(() => {
    if (totals !== null && currentPage > maxPage) {
      setPage(maxPage, { replace: true });
    }
  }, [totals, currentPage, maxPage, setPage]);

  const filterDisclosure = useDisclosure();

  const handleApplyFilters = useCallback(
    (newFilters: Filters<any>) => {
      setFilters(newFilters);
    },
    [setFilters],
  );

  const handleClearFilters = useCallback(() => {
    setFilters([]);
  }, [setFilters]);

  const handleRemoveFilter = useCallback(
    (filterId: string, valueToRemove?: string) => {
      // Special handling for createdOn date range filter
      if (filterId === "createdOn") {
        const createdOnFilter = filters.find((f) => f.id === "createdOn");
        if (!createdOnFilter || !Array.isArray(createdOnFilter.value)) {
          return;
        }
        const [from, to] = createdOnFilter.value as [string, string];

        if (!valueToRemove) {
          // Remove the entire filter
          setFilters(filters.filter((f) => f.id !== "createdOn"));
          return;
        }

        const newFrom = valueToRemove === "from" ? "" : from;
        const newTo = valueToRemove === "to" ? "" : to;

        if (!newFrom && !newTo) {
          setFilters(filters.filter((f) => f.id !== "createdOn"));
        } else {
          setFilters(
            filters.map((f) => (f.id === "createdOn" ? { ...f, value: [newFrom, newTo] } : f)),
          );
        }
        return;
      }

      removeFilter(filterId, valueToRemove, filters, setFilters);
    },
    [filters, setFilters],
  );

  const handleSortColumn = useCallback(
    (column: HeaderGroup<any>) => {
      const clicked = COLUMN_ID_TO_SORT_BY[column.id];
      if (clicked) {
        setSort(getNextSort({ sortBy, descending }, clicked));
      }
    },
    [setSort, sortBy, descending],
  );

  const columnCount = columns.length + 1;
  const isRowLoading = actionsAreLoading || isRefetching;

  return (
    <Flex direction="column" height="100%">
      <Flex alignItems="center" flexWrap="wrap" key="columnSelector" flex="none">
        <BoxesActions
          selectedBoxes={selectedFlatRows}
          isSelectAll={isSelectAll}
          selectedCount={selectedCount}
          onMoveBoxes={onMoveBoxes}
          locationOptions={locationOptions}
          onDeleteBoxes={onDeleteBoxes}
          onAssignTags={onAssignTags}
          onUnassignTags={onUnassignTags}
          tagOptions={tagOptions}
          onAssignBoxesToShipment={onAssignBoxesToShipment}
          shipmentOptions={shipmentOptions}
          onUnassignBoxesToShipment={onUnassignBoxesToShipment}
          actionsAreLoading={isRowLoading}
        />
        <Spacer />
        <HStack spacing={2} mb={2}>
          <ColumnSelector
            availableColumns={allColumns.filter(
              (column) => column.id !== "selection" && column.id !== "shipmentId",
            )}
          />
          <GlobalFilter
            globalFilter={search}
            setGlobalFilter={(value) => setSearch(value ?? "")}
            placeholder="Search comments"
            syncWithGlobalFilter
          />
          <FilterPanel
            isOpen={filterDisclosure.isOpen}
            onOpen={filterDisclosure.onOpen}
            onClose={filterDisclosure.onClose}
          >
            <BoxesFilter
              isOpen={filterDisclosure.isOpen}
              onClose={filterDisclosure.onClose}
              columnFilters={filters}
              onApplyFilters={handleApplyFilters}
              productOptions={productOptions}
              categoryOptions={categoryOptions}
              genderOptions={genderOptions}
              sizeOptions={sizeOptions}
              locationOptions={locationOptions}
              tagOptions={tagOptions}
            />
          </FilterPanel>
        </HStack>
      </Flex>
      <FilterChips
        filters={filters}
        productOptions={productOptions}
        categoryOptions={categoryOptions}
        genderOptions={genderOptions}
        sizeOptions={sizeOptions}
        locationOptions={locationOptions}
        tagOptions={tagOptions}
        onRemoveFilter={handleRemoveFilter}
        onClearAllFilters={handleClearFilters}
      />
      <Box bg="gray.100" px={4} py={2} mb={2} width="100%" data-testid="total-summary">
        {isLoading || totals === null ? (
          <HStack spacing={2}>
            <Text fontWeight="bold">Total</Text>
            <Skeleton height={5} width={20} />
          </HStack>
        ) : (
          <HStack spacing={10} data-testid="boxes-count">
            <Text fontWeight="bold">Total</Text>
            <Text>
              <Text as="span" fontWeight="bold">
                {totals.totalNumberOfBoxes}
              </Text>{" "}
              box{totals.totalNumberOfBoxes === 1 ? "" : "es"}
            </Text>
            <Text>
              <Text as="span" fontWeight="bold">
                {totals.totalNumberOfItems}
              </Text>{" "}
              items
            </Text>
            {showWeightAndValue && totals.totalWeight > 0 && (
              <Text>
                <Text as="span" fontWeight="bold">
                  {formatWeight(totals.totalWeight, null)}
                </Text>{" "}
                est. weight{weightUnit ? ` (${weightUnit})` : ""}
              </Text>
            )}
            {showWeightAndValue && totals.totalMonetaryValue > 0 && (
              <Text>
                <Text as="span" fontWeight="bold">
                  {formatMonetaryValue(totals.totalMonetaryValue, currency)}
                </Text>{" "}
                est. value
              </Text>
            )}
          </HStack>
        )}
      </Box>
      <Flex alignItems="center" mb={2} data-testid="selected-boxes-counter">
        {selectedCount > 0 && (
          <HStack spacing={5} bg="blue.100" px={4} py={2}>
            <Text as="span" fontWeight="bold" color="black">
              {selectedCount} {selectedCount === 1 ? "Box" : "Boxes"} selected
            </Text>{" "}
            <Text as="span" color="black" cursor="pointer" onClick={resetSelection}>
              Clear all
            </Text>
          </HStack>
        )}
        {selectedCount > 0 && (
          <Box as="span" color="gray.400" ml={4}>
            |
          </Box>
        )}
        {isLoading || totals === null ? (
          <HStack spacing={2}>
            <Skeleton height={5} width={20} />
          </HStack>
        ) : (
          <Text
            mx={4}
            cursor={isSelectAll || totalNumberOfBoxes === 0 ? "default" : "pointer"}
            color={isSelectAll || totalNumberOfBoxes === 0 ? "gray.400" : "black"}
            onClick={() => {
              if (!isSelectAll && totalNumberOfBoxes > 0) setIsSelectAll(true);
            }}
          >
            Select all {totalNumberOfBoxes} {totalNumberOfBoxes === 1 ? "box" : "boxes"}
          </Text>
        )}
      </Flex>
      <Table key="boxes-table">
        <FilteringSortingTableHeader
          headerGroups={headerGroups}
          hideColumnFilters={true}
          onSortColumn={handleSortColumn}
        />
        <Tbody>
          {isLoading && (
            <>
              <Tr key="loading1">
                <Td colSpan={columnCount}>
                  <Skeleton height={5} />
                </Td>
              </Tr>
              <Tr key="loading2">
                <Td colSpan={columnCount}>
                  <Skeleton height={5} />
                </Td>
              </Tr>
            </>
          )}

          {!isLoading &&
            page.map((row) => {
              prepareRow(row);
              if (row.isSelected && isRowLoading) {
                return (
                  <Tr key={row.original.labelIdentifier}>
                    <Td colSpan={columnCount}>
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
            onClick={() => setPage(currentPage - 1)}
            isDisabled={currentPage <= 1}
            icon={<ChevronLeftIcon h={6} w={6} />}
          />
        </Flex>

        <Flex justifyContent="center" m={4}>
          <Text as="span" data-testid="page-indicator">
            Page{" "}
            <Text fontWeight="bold" as="span">
              {currentPage}
            </Text>{" "}
            of{" "}
            {totals === null ? (
              <Skeleton height={5} width={10} mr={2} />
            ) : (
              <Text fontWeight="bold" as="span">
                {maxPage}
              </Text>
            )}
          </Text>
        </Flex>

        <Flex>
          <IconButton
            aria-label="Next Page"
            onClick={() => setPage(currentPage + 1)}
            isDisabled={isLoading || isPrefetching || currentPage >= maxPage}
            icon={<ChevronRightIcon h={6} w={6} />}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}

export default BoxesTable;
