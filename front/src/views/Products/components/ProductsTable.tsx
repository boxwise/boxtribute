import { useEffect, useMemo, useTransition } from "react";
import { QueryRef, useReadQuery } from "@apollo/client";
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
  Button,
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
import {
  includesOneOfMultipleStringsFilterFn,
  includesSomeObjectFilterFn,
} from "components/Table/Filter";
import { IUseTableConfigReturnType } from "hooks/hooks";
import IndeterminateCheckbox from "./Checkbox";
import { GlobalFilter } from "./GlobalFilter";
import { ProductRow, standardProductsRawDataToTableDataTransformer } from "./transformers";
import ColumnSelector from "./ColumnSelector";
import { useBaseIdParam } from "hooks/useBaseIdParam";
import {
  StandardProductsforProductsViewQuery,
  StandardProductsforProductsViewVariables,
} from "queries/types";

type ProductTableProps = {
  tableConfig: IUseTableConfigReturnType;
  onRefetch: (variables?: StandardProductsforProductsViewVariables) => void;
  productsQueryRef: QueryRef<StandardProductsforProductsViewQuery>;
  columns: Column<ProductRow>[];
  // onBoxRowClick?: (labelIdentified: string) => void;
  setSelectedBoxes?: (rows: Row<ProductRow>[]) => void;
  selectedRowsArePending: boolean;
};

function ProductsTable({
  tableConfig,
  onRefetch,
  productsQueryRef,
  columns,
  // onBoxRowClick,
  // setSelectedBoxes,
  selectedRowsArePending,
}: ProductTableProps) {
  const { baseId } = useBaseIdParam();
  const [refetchBoxesIsPending, startRefetchBoxes] = useTransition();
  const { data: rawData } = useReadQuery(productsQueryRef);
  const tableData = useMemo(
    () => standardProductsRawDataToTableDataTransformer(rawData),
    [rawData],
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
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    // selectedFlatRows,
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
    (hooks) => {
      hooks.visibleColumns.push((col) => [
        {
          id: "selection",
          Header: ({ getToggleAllPageRowsSelectedProps }: CellProps<any>) => (
            <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
          ),
          Cell: ({ row }: CellProps<any>) => (
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          ),
        },
        ...col,
      ]);
    },
  );

  // useEffect(() => {
  //   setSelectedBoxes(selectedFlatRows.map((row) => row));
  // }, [selectedFlatRows, setSelectedBoxes]);

  useEffect(() => {
    // refetch
    const newStateFilter = filters.find((filter) => filter.id === "state");
    const oldStateFilter = tableConfig.getColumnFilters().find((filter) => filter.id === "state");

    if (newStateFilter !== oldStateFilter) startRefetchBoxes(() => onRefetch({ baseId }));

    // update tableConfig
    if (globalFilter !== tableConfig.getGlobalFilter()) tableConfig.setGlobalFilter(globalFilter);

    if (filters !== tableConfig.getColumnFilters()) tableConfig.setColumnFilters(filters);

    if (sortBy !== tableConfig.getSortBy()) tableConfig.setSortBy(sortBy);

    if (hiddenColumns !== tableConfig.getHiddenColumns())
      tableConfig.setHiddenColumns(hiddenColumns);
  }, [baseId, filters, globalFilter, hiddenColumns, onRefetch, sortBy, tableConfig]);

  return (
    <Flex direction="column" height="100%">
      <Flex alignItems="center" flexWrap="wrap" key="columnSelector" flex="none">
        {/* TODO: bulk actions */}
        <ButtonGroup mb={2}>
          <Button>Enable</Button>
          <Button>Disable</Button>
        </ButtonGroup>
        <Spacer />
        <HStack spacing={2} mb={2}>
          <ColumnSelector availableColumns={allColumns} />
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
        </HStack>
      </Flex>
      {/* overflowY and flex={1} make the table scrollable vertically and took the other settings from <TableContainer>
      See https://chakra-ui.com/docs/components/table/usage#table-container */}
      <Box
        flex={1}
        display="block"
        maxWidth="100%"
        overflowX="auto"
        overflowY="auto"
        whiteSpace="nowrap"
      >
        <Table key="products-table">
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
                  backgroundColor={
                    row.original.instockItemsCount !== undefined ? "inherit" : "#D9D9D9"
                  }
                  cursor="pointer"
                  {...row.getRowProps()}
                  // onClick={() => onBoxRowClick(row.original.labelIdentifier)}
                  key={row.original.id}
                >
                  {row.cells.map((cell) => (
                    <Td key={`${row.original.name}-${cell.column.id}`}>{cell.render("Cell")}</Td>
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

export default ProductsTable;
