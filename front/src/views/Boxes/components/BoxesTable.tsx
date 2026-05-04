import { useEffect, useMemo, useTransition, useCallback } from "react";
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
  useGlobalFilter,
  useSortBy,
  useRowSelect,
  usePagination,
  CellProps,
  Filters,
} from "react-table";
import { FilteringSortingTableHeader } from "components/Table/TableHeader";
import { useAtomValue } from "jotai";
import { QueryRef, useReadQuery } from "@apollo/client";
import {
  includesOneOfMultipleStringsFilterFn,
  includesSomeObjectFilterFn,
  includesSomeTagObjectFilterFn,
  excludesSomeTagObjectFilterFn,
} from "components/Table/Filter";
import { IUseTableConfigReturnType } from "hooks/useTableConfig";
import IndeterminateCheckbox from "./Checkbox";
import { GlobalFilter } from "components/Table/GlobalFilter";
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
import { BoxesFilter } from "./BoxesFilter";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import { FilterChips } from "./FilterChips";
import { FilterPanel } from "components/Table/FilterPanel";
import { createOptions } from "utils/filterOptions";
import { removeFilter } from "utils/helpers";

interface IBoxesTableProps {
  tableConfig: IUseTableConfigReturnType;
  onRefetch: (variables?: BoxesForBoxesViewVariables) => void;
  boxesQueryRef: QueryRef<BoxesForBoxesViewQuery>;
  columns: Column<BoxRow>[];
  locationOptions: IFilterValue[];
  tagOptions: IFilterValue[];
  shipmentOptions: IDropdownOption[];
}

export const PAGE_SIZE = 50;

function BoxesTable({
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
      excludesSomeTagObject: excludesSomeTagObjectFilterFn,
    }),
    [],
  );

  function customGlobalFilter(rows, ids, filterValue) {
    // Custom filter for global table search that can handle both simple cell content (e.g. comment
    // or label identifier strings) and complex cell content (e.g. product objects; these would
    // otherwise be interpreted as [Object object] and hence not match)

    // To lower-case for case insensitive searching
    const search = String(filterValue).toLowerCase();

    return rows.filter((row) =>
      ids.some((id) => {
        const value = row.values[id];
        if (Array.isArray(value)) {
          // If value is an array (e.g. tags)
          return value.some((v) =>
            // Try matching v.name (object) or v (string)
            v && typeof v === "object"
              ? (v.name || "").toLowerCase().includes(search)
              : String(v).toLowerCase().includes(search),
          );
        } else if (typeof value === "object" && value !== null) {
          // Match on object.name
          return (value.name || "").toLowerCase().includes(search);
        } else {
          // Fallback: treat as string
          return String(value || "")
            .toLowerCase()
            .includes(search);
        }
      }),
    );
  }

  const {
    headerGroups,
    prepareRow,
    allColumns,
    state: { globalFilter, pageIndex, filters, sortBy, hiddenColumns },
    setGlobalFilter,
    page,
    rows,
    setAllFilters,
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
      globalFilter: customGlobalFilter,
      initialState: {
        hiddenColumns: tableConfig.getHiddenColumns(),
        sortBy: tableConfig.getSortBy(),
        pageIndex: 0,
        pageSize: PAGE_SIZE,
        filters: tableConfig.getColumnFilters(),
        ...(tableConfig.getGlobalFilter()
          ? { globalFilter: tableConfig.getGlobalFilter() }
          : undefined),
      },
      autoResetSelectedRows: true,
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
    // Helper to compare filter values (deep equality for arrays)
    const areFilterValuesEqual = (
      filter1: { id: string; value: any } | undefined,
      filter2: { id: string; value: any } | undefined,
    ): boolean => {
      if (!filter1 && !filter2) return true;
      if (!filter1 || !filter2) return false;

      const val1 = Array.isArray(filter1.value) ? filter1.value : [filter1.value];
      const val2 = Array.isArray(filter2.value) ? filter2.value : [filter2.value];

      if (val1.length !== val2.length) return false;

      // Sort and compare arrays
      const sorted1 = [...val1].sort();
      const sorted2 = [...val2].sort();
      return sorted1.every((v, i) => v === sorted2[i]);
    };

    // refetch only if state or location filter actually changed
    const newStateFilter = filters.find((filter) => filter.id === "state");
    const oldStateFilter = tableConfig.getColumnFilters().find((filter) => filter.id === "state");
    const newLocationFilter = filters.find((filter) => filter.id === "location");
    const oldLocationFilter = tableConfig
      .getColumnFilters()
      .find((filter) => filter.id === "location");

    if (
      !areFilterValuesEqual(newStateFilter, oldStateFilter) ||
      !areFilterValuesEqual(newLocationFilter, oldLocationFilter)
    ) {
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

  const filterDisclosure = useDisclosure();

  const productOptions = useMemo(() => {
    const enrichedData = tableData.map((row) => ({
      product: row.product?.id
        ? { id: row.product.id, name: `${row.product.name} (${row.gender?.name || ""})` }
        : null,
    }));
    return createOptions(enrichedData, "product");
  }, [tableData]);

  const genderOptions = useMemo(() => createOptions(tableData, "gender"), [tableData]);

  const sizeOptions = useMemo(() => createOptions(tableData, "size"), [tableData]);

  const handleApplyFilters = useCallback(
    (newFilters: Filters<any>) => {
      setAllFilters(newFilters);
    },
    [setAllFilters],
  );

  const handleClearFilters = useCallback(() => {
    setAllFilters([]);
  }, [setAllFilters]);

  const handleRemoveFilter = useCallback(
    (filterId: string, valueToRemove?: string) => {
      removeFilter(filterId, valueToRemove, filters, setAllFilters);
    },
    [filters, setAllFilters],
  );

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
        <HStack spacing={2} mb={2}>
          <ColumnSelector
            availableColumns={allColumns.filter(
              (column) =>
                column.id !== "shipment" && column.id !== "selection" && column.id !== "no_tags",
            )}
          />
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
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
        genderOptions={genderOptions}
        sizeOptions={sizeOptions}
        locationOptions={locationOptions}
        tagOptions={tagOptions}
        onRemoveFilter={handleRemoveFilter}
        onClearAllFilters={handleClearFilters}
      />
      <Box bg="gray.100" px={4} py={2} mb={2} width="100%" data-testid="total-summary">
        {refetchBoxesIsPending || tableConfig.isNotMounted ? (
          <HStack spacing={2}>
            <Text fontWeight="bold">Total</Text>
            <Skeleton height={5} width={20} />
          </HStack>
        ) : (
          <HStack spacing={10} data-testid="boxes-count">
            <Text fontWeight="bold">Total</Text>
            <Text>
              <Text as="span" fontWeight="bold">
                {boxCount}
              </Text>{" "}
              box{boxCount === 1 ? "" : "es"}
            </Text>
            <Text>
              <Text as="span" fontWeight="bold">
                {itemsCount}
              </Text>{" "}
              items
            </Text>
          </HStack>
        )}
      </Box>
      <Table key="boxes-table">
        <FilteringSortingTableHeader headerGroups={headerGroups} hideColumnFilters={true} />
        <Tbody>
          {(refetchBoxesIsPending || tableConfig.isNotMounted) && (
            <Tr key="refetchIsPending1">
              <Td colSpan={columns.length + 1}>
                <Skeleton height={5} />
              </Td>
            </Tr>
          )}
          {(refetchBoxesIsPending || tableConfig.isNotMounted) && (
            <Tr key="refetchIsPending2">
              <Td colSpan={columns.length + 1}>
                <Skeleton height={5} />
              </Td>
            </Tr>
          )}

          {page.map((row) => {
            prepareRow(row);
            if (row.isSelected && actionsAreLoading) {
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
            {refetchBoxesIsPending ? (
              <Skeleton height={5} width={10} mr={2} />
            ) : (
              <Text fontWeight="bold" as="span">
                {pageOptions.length}
              </Text>
            )}
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
