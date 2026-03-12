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
import { BoxesFilterDrawer } from "./BoxesFilterDrawer";
import { MdFilterList } from "react-icons/md";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import { FilterChips } from "./FilterChips";

interface IBoxesTableProps {
  isBackgroundFetchOfBoxesLoading: boolean;
  hasExecutedInitialFetchOfBoxes: { current: boolean };
  tableConfig: IUseTableConfigReturnType;
  onRefetch: (variables?: BoxesForBoxesViewVariables) => void;
  boxesQueryRef: QueryRef<BoxesForBoxesViewQuery>;
  columns: Column<BoxRow>[];
  locationOptions: IFilterValue[];
  tagOptions: IFilterValue[];
  shipmentOptions: IDropdownOption[];
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

    // refetch only if state filter actually changed
    const newStateFilter = filters.find((filter) => filter.id === "state");
    const oldStateFilter = tableConfig.getColumnFilters().find((filter) => filter.id === "state");

    if (!areFilterValuesEqual(newStateFilter, oldStateFilter)) {
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

  const filterDrawerDisclosure = useDisclosure();

  const productOptions = useMemo(() => {
    const uniqueProducts = new Map<string, { id: string; name: string; gender: string }>();
    tableData.forEach((row) => {
      if (row.product && row.product.id && row.product.name) {
        const key = row.product.id;
        if (!uniqueProducts.has(key)) {
          uniqueProducts.set(key, {
            id: row.product.id,
            name: row.product.name,
            gender: row.gender?.name || "",
          });
        }
      }
    });
    return Array.from(uniqueProducts.values())
      .map((p) => ({
        label: `${p.name} (${p.gender})`,
        value: p.id,
        urlId: p.id,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [tableData]);

  const genderOptions = useMemo(() => {
    const uniqueGenders = new Map<string, { id: string; name: string }>();
    tableData.forEach((row) => {
      if (row.gender && row.gender.name) {
        uniqueGenders.set(row.gender.id, { id: row.gender.id, name: row.gender.name });
      }
    });
    return Array.from(uniqueGenders.values())
      .map((g) => ({ label: g.name, value: g.id, urlId: g.id }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [tableData]);

  const sizeOptions = useMemo(() => {
    const uniqueSizes = new Map<string, { id: string; name: string }>();
    tableData.forEach((row) => {
      if (row.size && row.size.name) {
        uniqueSizes.set(row.size.id, { id: row.size.id, name: row.size.name });
      }
    });
    return Array.from(uniqueSizes.values())
      .map((s) => ({ label: s.name, value: s.id, urlId: s.id }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [tableData]);

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
      const updatedFilters = filters
        .map((filter) => {
          if (filter.id === filterId) {
            if (!valueToRemove) {
              // Remove entire filter
              return null;
            }
            // Remove specific value from filter
            const remainingValues = Array.isArray(filter.value)
              ? filter.value.filter((v: string) => v !== valueToRemove)
              : [];
            return remainingValues.length > 0 ? { ...filter, value: remainingValues } : null;
          }
          return filter;
        })
        .filter((f) => f !== null) as Filters<any>;

      setAllFilters(updatedFilters);
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
              (column) => column.id !== "shipment" && column.id !== "selection",
            )}
          />
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
          <IconButton
            icon={<MdFilterList color={"white"} size={25} />}
            aria-label="Open filters"
            size="md"
            onClick={filterDrawerDisclosure.onOpen}
            data-testid="filter-drawer-button"
            background="blue.500"
          />
          <BoxesFilterDrawer
            isOpen={filterDrawerDisclosure.isOpen}
            onClose={filterDrawerDisclosure.onClose}
            columnFilters={filters}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            productOptions={productOptions}
            genderOptions={genderOptions}
            sizeOptions={sizeOptions}
            locationOptions={locationOptions}
            tagOptions={tagOptions}
          />
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
      <Flex direction="column" overflowX="auto">
        <Table key="boxes-table">
          <FilteringSortingTableHeader headerGroups={headerGroups} hideColumnFilters={true} />
          <Tbody>
            <Tr key={"boxes-count-row"} bg={"gray.100"}>
              <Td fontWeight="bold" key={"product-total"}>
                Total
              </Td>
              <Td fontWeight="bold" key={"boxes-count"} data-testid="boxes-count">
                {isBackgroundFetchOfBoxesLoading ||
                refetchBoxesIsPending ||
                tableConfig.isNotMounted ? (
                  <Skeleton height={5} width={10} mr={2} />
                ) : hasExecutedInitialFetchOfBoxes.current ? (
                  <Text as="span">
                    {boxCount} box{boxCount === 1 ? "" : "es"}
                  </Text>
                ) : (
                  <Text as="span">Data unavailable</Text>
                )}
              </Td>
              <Td fontWeight="bold" key={"item-count"}>
                {isBackgroundFetchOfBoxesLoading ||
                refetchBoxesIsPending ||
                tableConfig.isNotMounted ? (
                  <Skeleton height={5} width={10} mr={2} />
                ) : hasExecutedInitialFetchOfBoxes.current ? (
                  <Text as="span">{itemsCount} items</Text>
                ) : (
                  <Text as="span">Data unavailable</Text>
                )}
              </Td>
              <Td colSpan={20}></Td>
            </Tr>
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
      </Flex>
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
