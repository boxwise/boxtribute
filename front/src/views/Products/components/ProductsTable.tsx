import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Column,
  Filters,
  useTable,
  useFilters,
  useGlobalFilter,
  useGroupBy,
  useSortBy,
  useRowSelect,
  defaultOrderByFn,
} from "react-table";
import {
  Table,
  Tr,
  Tbody,
  Td,
  Flex,
  Button,
  HStack,
  useDisclosure,
  FormControl,
  FormLabel,
  Switch,
  Box,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { AddIcon } from "@chakra-ui/icons";
import { IUseTableConfigReturnType } from "hooks/useTableConfig";
import { ProductRow } from "./transformers";
import { removeFilter } from "utils/helpers";
import { FilteringSortingTableHeader } from "components/Table/TableHeader";
import {
  includesOneOfMultipleStringsFilterFn,
  includesSomeObjectFilterFn,
} from "components/Table/Filter";
import ColumnSelector from "components/Table/ColumnSelector";
import { GlobalFilter } from "components/Table/GlobalFilter";
import { FilterPanel } from "@boxtribute/shared-components/filter/FilterPanel";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import { ProductsFilter } from "./ProductsFilter";
import { ProductsFilterChips } from "./ProductsFilterChips";

type ProductTableProps = {
  tableConfig: IUseTableConfigReturnType;
  tableData;
  columns: Column<ProductRow>[];
  onRowClick: (productId: string, isStandard: boolean) => void;
  categoryOptions: IFilterValue[];
  genderOptions: IFilterValue[];
  sizeRangeOptions: IFilterValue[];
};

function ProductsTable({
  tableConfig,
  tableData,
  columns,
  onRowClick,
  categoryOptions,
  genderOptions,
  sizeRangeOptions,
}: ProductTableProps) {
  const [showOnlyAssort, setShowOnlyAssort] = useState(false);

  const filteredData = useMemo(
    () => (showOnlyAssort ? tableData.filter((row) => row.isStandard) : tableData),
    [showOnlyAssort, tableData],
  );

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
      data: filteredData,
      filterTypes,
      orderByFn: (rows, sortFns, dirs) => {
        if (rows.length > 0 && rows[0].isGrouped) {
          return [...rows].sort((a, b) => String(a.groupByVal).localeCompare(String(b.groupByVal)));
        }
        return defaultOrderByFn(rows, sortFns, dirs);
      },
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
    <Flex direction="column" height="100%">
      <Flex
        direction={{ base: "column", md: "row" }}
        alignItems={{ base: "flex-start", md: "center" }}
        key="columnSelector"
        flex="none"
      >
        <Link to="create">
          <Button leftIcon={<AddIcon />} mb={2} borderRadius="0">
            Add New Product
          </Button>
        </Link>
        <Flex wrap="wrap" mb={2} ml={{ md: "auto" }} gap={2} alignItems="center">
          <FormControl display="flex" alignItems="center" width="auto">
            <Switch
              id="show-only-assort"
              isChecked={showOnlyAssort}
              onChange={(e) => setShowOnlyAssort(e.target.checked)}
              mr={2}
            />
            <FormLabel htmlFor="show-only-assort" mb={0} whiteSpace="nowrap" fontWeight="normal">
              <Box as="span" display={{ base: "none", md: "inline" }}>
                Show only ASSORT products
              </Box>
              <Box as="span" display={{ base: "inline", md: "none" }}>
                Only ASSORT
              </Box>
            </FormLabel>
          </FormControl>
          <HStack spacing={2} ml="auto">
            <ColumnSelector
              availableColumns={allColumns.filter(
                (column) => column.id !== "category" && column.id !== "actionButton",
              )}
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
      </Flex>
      <ProductsFilterChips
        filters={filters}
        categoryOptions={categoryOptions}
        genderOptions={genderOptions}
        sizeRangeOptions={sizeRangeOptions}
        onRemoveFilter={handleRemoveFilter}
        onClearAllFilters={handleClearFilters}
      />
      <Box overflowX="auto">
        <Table key="products-table">
          <FilteringSortingTableHeader headerGroups={headerGroups} hideColumnFilters={true} />
          <Tbody>
            <Tr key={"header-spacer"}>
              <Td colSpan={headerGroups[0]?.headers.length} p={0} border="none" h="16px" />
            </Tr>

            {rows.map((row) => {
              prepareRow(row);

              if (row.isGrouped) {
                return (
                  <React.Fragment key={row.id}>
                    <Tr backgroundColor="gray.50" fontWeight="bold">
                      {headerGroups[0]?.headers.map((header) => (
                        <Td key={header.id}>
                          {header.id === "name"
                            ? `${row.groupByVal} (${row.subRows.length})`
                            : null}
                        </Td>
                      ))}
                    </Tr>
                    {row.subRows.map((subRow) => {
                      prepareRow(subRow);
                      return (
                        <Tr
                          {...subRow.getRowProps()}
                          key={subRow.original.id}
                          onClick={() =>
                            onRowClick(
                              subRow.original.isStandard
                                ? subRow.original.standardInstantiationId
                                : subRow.original.id,
                              subRow.original.isStandard,
                            )
                          }
                          cursor="pointer"
                        >
                          {subRow.cells.map((cell) =>
                            cell.isGrouped ? null : (
                              <Td
                                {...cell.getCellProps()}
                                key={`${subRow.values.id}-${cell.column.id}`}
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
      </Box>
    </Flex>
  );
}

export default ProductsTable;
