import React, { useCallback, useEffect, useMemo } from "react";
import {
  Column,
  Filters,
  useTable,
  useFilters,
  useGlobalFilter,
  useGroupBy,
  useSortBy,
  useRowSelect,
} from "react-table";
import { Table, Tr, Tbody, Td, Spacer, Flex, HStack, useDisclosure } from "@chakra-ui/react";
import { IUseTableConfigReturnType } from "hooks/useTableConfig";
import { StandardProductRow } from "./transformers";
import { removeFilter } from "utils/helpers";
import { FilteringSortingTableHeader } from "components/Table/TableHeader";
import {
  includesOneOfMultipleStringsFilterFn,
  includesSomeObjectFilterFn,
} from "components/Table/Filter";
import ColumnSelector from "components/Table/ColumnSelector";
import { GlobalFilter } from "components/Table/GlobalFilter";
import { FilterPanel } from "components/Table/FilterPanel";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import { ProductsFilter } from "./ProductsFilter";
import { ProductsFilterChips } from "./ProductsFilterChips";

type StandardProductTableProps = {
  tableConfig: IUseTableConfigReturnType;
  tableData;
  columns: Column<StandardProductRow>[];
  categoryOptions: IFilterValue[];
  genderOptions: IFilterValue[];
  sizeRangeOptions: IFilterValue[];
};

function StandardProductsTable({
  tableConfig,
  tableData,
  columns,
  categoryOptions,
  genderOptions,
  sizeRangeOptions,
}: StandardProductTableProps) {
  // Add custom filter function to filter objects in a column https://react-table-v7.tanstack.com/docs/examples/filtering
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
    rows,
    state: { globalFilter, filters, sortBy, hiddenColumns },
    setGlobalFilter,
    setAllFilters,
  } = useTable(
    {
      columns,
      data: tableData,
      filterTypes,
      initialState: {
        hiddenColumns: tableConfig.getHiddenColumns(),
        sortBy: tableConfig.getSortBy(),
        filters: tableConfig.getColumnFilters(),
        groupBy: ["category"],
        ...(tableConfig.getGlobalFilter()
          ? { globalFilter: tableConfig.getGlobalFilter() }
          : undefined),
      },
    },
    useFilters,
    useGlobalFilter,
    useGroupBy,
    useSortBy,
    useRowSelect,
  );

  useEffect(() => {
    // update tableConfig
    if (globalFilter !== tableConfig.getGlobalFilter()) tableConfig.setGlobalFilter(globalFilter);

    if (filters !== tableConfig.getColumnFilters()) tableConfig.setColumnFilters(filters);

    if (sortBy !== tableConfig.getSortBy()) tableConfig.setSortBy(sortBy);

    if (hiddenColumns !== tableConfig.getHiddenColumns())
      tableConfig.setHiddenColumns(hiddenColumns);
  }, [filters, globalFilter, hiddenColumns, sortBy, tableConfig]);

  const filterDisclosure = useDisclosure();

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
    <Flex direction="column" overflowX="auto">
      <Flex alignItems="center" flexWrap="wrap" key="columnSelector" flex="none">
        <Spacer />
        <HStack spacing={2} mb={2}>
          <ColumnSelector
            availableColumns={allColumns.filter((column) => column.id !== "actionButton")}
          />
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
          <FilterPanel
            isOpen={filterDisclosure.isOpen}
            onOpen={filterDisclosure.onOpen}
            onClose={filterDisclosure.onClose}
          >
            <ProductsFilter
              isOpen={filterDisclosure.isOpen}
              onClose={filterDisclosure.onClose}
              columnFilters={filters}
              onApplyFilters={handleApplyFilters}
              categoryOptions={categoryOptions}
              genderOptions={genderOptions}
              sizeRangeOptions={sizeRangeOptions}
            />
          </FilterPanel>
        </HStack>
      </Flex>
      <ProductsFilterChips
        filters={filters}
        categoryOptions={categoryOptions}
        genderOptions={genderOptions}
        sizeRangeOptions={sizeRangeOptions}
        onRemoveFilter={handleRemoveFilter}
        onClearAllFilters={handleClearFilters}
      />
      <Table key="standard-products-table">
        <FilteringSortingTableHeader headerGroups={headerGroups} hideColumnFilters={true} />
        <Tbody>
          <Tr key={"header-spacer-std"}>
            <Td colSpan={headerGroups[0]?.headers.length} p={0} border="none" h="16px" />
          </Tr>

          {rows.map((row) => {
            prepareRow(row);

            if (row.isGrouped) {
              return (
                <React.Fragment key={row.id}>
                  <Tr bg="gray.100" fontWeight="bold">
                    <Td colSpan={headerGroups[0]?.headers.length}>
                      {row.groupByVal} ({row.subRows.length})
                    </Td>
                  </Tr>
                  {row.subRows.map((subRow) => {
                    prepareRow(subRow);
                    return (
                      <Tr
                        backgroundColor={subRow.values.enabled ? "inherit" : "#D9D9D9"}
                        {...subRow.getRowProps()}
                        key={subRow.original.id}
                      >
                        {subRow.cells.map((cell) =>
                          cell.isGrouped ? null : (
                            <Td
                              {...cell.getCellProps()}
                              key={`${subRow.values.name}-${cell.column.id}`}
                            >
                              {cell.isPlaceholder ? null : cell.render("Cell")}
                            </Td>
                          ),
                        )}
                      </Tr>
                    );
                  })}
                </React.Fragment>
              );
            }

            return null;
          })}
        </Tbody>
      </Table>
    </Flex>
  );
}

export default StandardProductsTable;
