import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Column,
  Filters,
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useRowSelect,
  usePagination,
} from "react-table";
import {
  Table,
  Tr,
  Tbody,
  Td,
  Spacer,
  Flex,
  Text,
  IconButton,
  Button,
  HStack,
  useDisclosure,
  FormControl,
  FormLabel,
  Switch,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { AddIcon, ChevronRightIcon, ChevronLeftIcon } from "@chakra-ui/icons";
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
import { FilterPanel } from "components/Table/FilterPanel";
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
    state: { globalFilter, pageIndex, filters, sortBy, hiddenColumns },
    setGlobalFilter,
    setAllFilters,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
  } = useTable(
    {
      columns,
      data: filteredData,
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
        <Link to="create">
          <Button leftIcon={<AddIcon />} mb={2} borderRadius="0">
            Add New Product
          </Button>
        </Link>
        <Spacer />
        <HStack spacing={2} mb={2}>
          <FormControl display="flex" alignItems="center">
            <Switch
              id="show-only-assort"
              isChecked={showOnlyAssort}
              onChange={(e) => setShowOnlyAssort(e.target.checked)}
              mr={2}
            />
            <FormLabel htmlFor="show-only-assort" mb={0} whiteSpace="nowrap">
              Show only ASSORT products
            </FormLabel>
          </FormControl>
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
      <Table key="products-table">
        <FilteringSortingTableHeader headerGroups={headerGroups} hideColumnFilters={true} />
        <Tbody>
          {page.map((row) => {
            prepareRow(row);
            return (
              <Tr
                {...row.getRowProps()}
                key={row.original.id}
                onClick={() =>
                  onRowClick(
                    row.original.isStandard
                      ? row.original.standardInstantiationId
                      : row.original.id,
                    row.original.isStandard,
                  )
                }
                cursor="pointer"
              >
                {row.cells.map((cell) => (
                  <Td {...cell.getCellProps()} key={`${row.values.id}-${cell.column.id}`}>
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

export default ProductsTable;
