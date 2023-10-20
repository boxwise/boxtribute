import React, { useEffect } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import {
  Table,
  Tr,
  Tbody,
  Td,
  Spacer,
  Flex,
  Text,
  IconButton,
  ButtonGroup,
} from "@chakra-ui/react";
import {
  Column,
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useRowSelect,
  usePagination,
} from "react-table";
import { FilteringSortingTableHeader } from "components/Table/TableHeader";
import { tableConfigsVar } from "queries/cache";
import { useReactiveVar } from "@apollo/client";
import IndeterminateCheckbox from "./Checkbox";
import { GlobalFilter } from "./GlobalFilter";
import { BoxRow } from "./types";

interface IBoxesTableProps {
  tableConfigKey: string;
  tableData: BoxRow[];
  columns: Column<BoxRow>[];
  actionButtons: React.ReactNode[];
  columnSelector: React.ReactNode;
  onBoxRowClick: (labelIdentified: string) => void;
}

function BoxesTable({
  tableConfigKey,
  tableData,
  columns,
  actionButtons,
  columnSelector,
  onBoxRowClick,
}: IBoxesTableProps) {
  const tableConfigsState = useReactiveVar(tableConfigsVar);

  const tableConfig = tableConfigsState?.get(tableConfigKey);
  if (tableConfig == null) {
    tableConfigsState.set(tableConfigKey, {
      globalFilter: undefined,
      columnFilters: [],
    });
    tableConfigsVar(tableConfigsState);
  }

  const {
    headerGroups,
    prepareRow,
    state: { globalFilter, pageIndex, filters },
    setGlobalFilter,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    selectedFlatRows,
  } = useTable(
    // TODO: remove this ts-ignore again and try to fix the type error properly
    // was most likely caused by setting one of the following flags in .tsconfig:
    // "strictNullChecks": true
    // "strictFunctionTypes": false
    {
      // @ts-ignore
      columns,
      data: tableData,
      initialState: {
        pageIndex: 0,
        pageSize: 20,
        filters: tableConfig?.columnFilters ?? [],
        ...(tableConfig?.globalFilter != null
          ? { globalFilter: tableConfig?.globalFilter }
          : undefined),
      },
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      // eslint-disable-next-line no-shadow
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          // eslint-disable-next-line react/no-unstable-nested-components
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          ),
          // eslint-disable-next-line react/no-unstable-nested-components
          Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
        },
        ...columns,
      ]);
    },
  );

  useEffect(() => {
    tableConfigsState.set(tableConfigKey, {
      globalFilter,
      columnFilters: filters,
    });
    tableConfigsVar(tableConfigsState);
  }, [globalFilter, filters, tableConfig, tableConfigsState, tableConfigKey]);

  return (
    <>
      <Flex alignItems="center" flexWrap="wrap">
        <ButtonGroup>{actionButtons}</ButtonGroup>
        <Spacer />
        {columnSelector}
        <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
      </Flex>

      <Table>
        <FilteringSortingTableHeader headerGroups={headerGroups} />
        <Tbody>
          {page.map((row) => {
            prepareRow(row);
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
      <Flex justifyContent="center" alignItems="center">
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
    </>
  );
}

export default BoxesTable;
