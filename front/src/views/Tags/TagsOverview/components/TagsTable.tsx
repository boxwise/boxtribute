import {
  Column,
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useRowSelect,
  CellProps,
} from "react-table";
import { Table, Tr, Tbody, Td, Spacer, Flex, HStack, Box } from "@chakra-ui/react";
import { IUseTableConfigReturnType } from "hooks/useTableConfig";
import { FilteringSortingTableHeader } from "components/Table/TableHeader";
import ColumnSelector from "components/Table/ColumnSelector";
import { GlobalFilter } from "components/Table/GlobalFilter";
import { TagRow } from "./transformers";
import IndeterminateCheckbox from "views/Boxes/components/Checkbox";
import { TagsActions } from "views/Tags/TagsOverview/components/TagsActions";
import { useTagsActions } from "views/Tags/hooks/useTagsActions";

type TagsTableProps = {
  tableConfig: IUseTableConfigReturnType;
  tableData: TagRow[];
  columns: Column<TagRow>[];
  onRowClick: (tagId: string) => void;
};

export function TagsTable({ tableConfig, tableData, columns, onRowClick }: TagsTableProps) {
  const {
    headerGroups,
    prepareRow,
    allColumns,
    state: { globalFilter },
    rows,
    setGlobalFilter,
    selectedFlatRows,
  } = useTable(
    {
      columns,
      data: tableData,
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

  return (
    <Flex direction="column" height="100%">
      <Flex alignItems="center" flexWrap="wrap" key="columnSelector" flex="none">
        <TagsActions
          selectedTags={selectedFlatRows}
          onDeleteTags={onDeleteTags}
          actionsAreLoading={actionsAreLoading}
        />
        <Spacer />
        <HStack spacing={2} mb={2}>
          <ColumnSelector
            availableColumns={allColumns.filter((column) => column.id !== "selection")}
          />
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
        </HStack>
      </Flex>
      <Box overflowX="auto">
        <Table key="products-table">
          <FilteringSortingTableHeader headerGroups={headerGroups} hideColumnFilters={true} />
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
      </Box>
    </Flex>
  );
}
