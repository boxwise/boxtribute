import {
  Column,
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useRowSelect,
  CellProps,
} from "react-table";
import { Table, Tr, Tbody, Td, Spacer, Flex, HStack } from "@chakra-ui/react";
import { IUseTableConfigReturnType } from "hooks/useTableConfig";
import { FilteringSortingTableHeader } from "components/Table/TableHeader";
import ColumnSelector from "components/Table/ColumnSelector";
import { GlobalFilter } from "components/Table/GlobalFilter";
import { TagRow } from "./transformers";
import IndeterminateCheckbox from "views/Boxes/components/Checkbox";
import { TagsActions } from "views/Tags/TagsOverview/components/TagsActions";
import { useTagsActions } from "views/Tags/hooks/useTagsActions";
import { TagsForTagsContainerVariables } from "./TagsContainer";

type TagsTableProps = {
  tableConfig: IUseTableConfigReturnType;
  tableData: TagRow[];
  refetchData: (variables?: TagsForTagsContainerVariables) => void;
  columns: Column<TagRow>[];
  onRowClick: (tagId: string) => void;
};

export function TagsTable({
  tableConfig,
  tableData,
  // refetchData,
  columns,
  onRowClick,
}: TagsTableProps) {
  // Add custom filter function to filter objects in a column https://react-table-v7.tanstack.com/docs/examples/filtering
  // const filterTypes = useMemo(
  //   () => ({
  //     includesSomeObject: includesSomeObjectFilterFn,
  //     includesOneOfMultipleStrings: includesOneOfMultipleStringsFilterFn,
  //   }),
  //   [],
  // );

  const {
    headerGroups,
    prepareRow,
    allColumns,
    state: { globalFilter },
    rows,
    setGlobalFilter,
    selectedFlatRows,
    // toggleRowSelected,
  } = useTable(
    {
      columns,
      data: tableData,
      // filterTypes,
      initialState: {
        hiddenColumns: tableConfig.getHiddenColumns(),
        sortBy: tableConfig.getSortBy(),
        filters: tableConfig.getColumnFilters(),
        ...(tableConfig.getGlobalFilter()
          ? { globalFilter: tableConfig.getGlobalFilter() }
          : undefined),
      },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((col) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }: CellProps<any, any>) => (
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          ),
          Cell: ({ row }: CellProps<any, any>) => (
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          ),
        },
        ...col,
      ]);
    },
  );

  const { onDeleteTags, actionsAreLoading } = useTagsActions(selectedFlatRows);

  // useEffect(() => {
  //   // refetch
  //   const newStateFilter = filters.find((filter) => filter.id === "state");
  //   const oldStateFilter = tableConfig.getColumnFilters().find((filter) => filter.id === "state");
  //   if (newStateFilter !== oldStateFilter) {
  //     refetchData({
  //       baseId,
  //     });
  //   }

  //   // update tableConfig
  //   if (globalFilter !== tableConfig.getGlobalFilter()) tableConfig.setGlobalFilter(globalFilter);

  //   if (filters !== tableConfig.getColumnFilters()) tableConfig.setColumnFilters(filters);

  //   if (sortBy !== tableConfig.getSortBy()) tableConfig.setSortBy(sortBy);

  //   if (hiddenColumns !== tableConfig.getHiddenColumns())
  //     tableConfig.setHiddenColumns(hiddenColumns);
  // }, [baseId, filters, globalFilter, hiddenColumns, refetchData, sortBy, tableConfig]);

  return (
    <Flex direction="column" overflowX="auto">
      <Flex alignItems="center" flexWrap="wrap" key="columnSelector" flex="none">
        <TagsActions
          selectedTags={selectedFlatRows}
          onDeleteTags={onDeleteTags}
          actionsAreLoading={actionsAreLoading}
        />
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
          {rows.map((row) => {
            prepareRow(row);
            return (
              <Tr
                {...row.getRowProps()}
                key={row.original.id}
                onClick={() => onRowClick(row.original.id)}
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
    </Flex>
  );
}
