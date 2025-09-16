import { useEffect, useMemo } from "react";
import {
  Column,
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useRowSelect,
  usePagination,
} from "react-table";
import { Table, Tr, Tbody, Td, Spacer, Flex, Text, IconButton, HStack } from "@chakra-ui/react";
import { ChevronRightIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import { IUseTableConfigReturnType } from "hooks/hooks";
import { ProductRow } from "./transformers";
import { FilteringSortingTableHeader } from "components/Table/TableHeader";
import {
  includesOneOfMultipleStringsFilterFn,
  includesSomeObjectFilterFn,
} from "components/Table/Filter";
import ColumnSelector from "components/Table/ColumnSelector";
import { GlobalFilter } from "components/Table/GlobalFilter";

type ProductTableProps = {
  tableConfig: IUseTableConfigReturnType;
  tableData;
  columns: Column<ProductRow>[];
  onRowClick: (productId: string, isStandard: boolean) => void;
};

function ProductsTable({ tableConfig, tableData, columns, onRowClick }: ProductTableProps) {
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
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
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

  return (
    <Flex direction="column" overflowX="auto">
      <Flex alignItems="center" flexWrap="wrap" key="columnSelector" flex="none">
        <Spacer />
        <HStack spacing={2} mb={2}>
          <ColumnSelector
            availableColumns={allColumns.filter((column) => column.id !== "actionButton")}
          />
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
        </HStack>
      </Flex>
      <Table key="products-table">
        <FilteringSortingTableHeader headerGroups={headerGroups} />
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
