import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Flex,
  HStack,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  Tabs,
  Tbody,
  Td,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import {
  CellProps,
  Column,
  HeaderGroup,
  TableState,
  useRowSelect,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import { FilteringSortingTableHeader } from "components/Table/TableHeader";
import ColumnSelector from "components/Table/ColumnSelector";
import { GlobalFilter } from "components/Table/GlobalFilter";
import { PaginationControls } from "components/Table/PaginationControls";
import { SelectAll } from "components/Table/SelectAll";
import { SkeletonRows } from "components/Table/SkeletonRows";
import { IUseTableConfigReturnType } from "hooks/useTableConfig";
import { FilterPanel } from "@boxtribute/shared-components/filter/FilterPanel";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import IndeterminateCheckbox from "views/Boxes/components/Checkbox";
import { PAGE_SIZE } from "views/Boxes/boxesViewUrlState";
import { BeneficiaryRow, IBeneficiaryTag } from "./types";
import { beneficiaryRowsToTableDataTransformer } from "./transformers";
import { BeneficiariesFilter } from "./BeneficiariesFilter";
import { BeneficiaryFilterChips } from "./BeneficiaryFilterChips";
import { useBeneficiariesViewUrlState } from "../hooks/useBeneficiariesViewUrlState";
import { useBeneficiaryRows } from "../hooks/useBeneficiaryRows";
import {
  BeneficiariesTab,
  COLUMN_ID_TO_SORT_BY,
  IBeneficiaryFilters,
  SORT_BY_TO_COLUMN_ID,
  TABS,
  getNextSort,
} from "../beneficiariesViewUrlState";

interface IBeneficiariesTableProps {
  baseId: string;
  /** The state of the view derived from the URL */
  urlState: ReturnType<typeof useBeneficiariesViewUrlState>;
  tableConfig: IUseTableConfigReturnType;
  columns: Column<BeneficiaryRow>[];
  tags: IBeneficiaryTag[];
  tagOptions: IFilterValue[];
}

const TAB_TITLES: Record<BeneficiariesTab, string> = {
  active: "Active",
  deactivated: "Deactivated",
};

function BeneficiariesTable({
  baseId,
  urlState,
  tableConfig,
  columns,
  tags,
  tagOptions,
}: IBeneficiariesTableProps) {
  const {
    tab,
    pages,
    page: currentPage,
    search,
    sortBy,
    descending,
    genders,
    tagIds,
    excludedTagIds,
    createdFrom,
    createdTo,
    quickFilters,
    setTab,
    setFilters,
    setSearch,
    setSort,
    setPage,
  } = urlState;

  const filters: IBeneficiaryFilters = useMemo(
    () => ({ genders, tagIds, excludedTagIds, createdFrom, createdTo, quickFilters }),
    [genders, tagIds, excludedTagIds, createdFrom, createdTo, quickFilters],
  );

  const viewOfTab = (deactivated: boolean) => ({
    baseId,
    deactivated,
    ...filters,
    search,
    sortBy,
    descending,
  });
  const rowsOfTabs = {
    active: useBeneficiaryRows({
      view: viewOfTab(false),
      page: pages.active,
      isSelected: tab === "active",
    }),
    deactivated: useBeneficiaryRows({
      view: viewOfTab(true),
      page: pages.deactivated,
      isSelected: tab === "deactivated",
    }),
  };
  const { rows, totalNumberOfBeneficiaries, maxPage, isLoading, isPrefetching } = rowsOfTabs[tab];

  const tableData = useMemo(
    () => beneficiaryRowsToTableDataTransformer(rows, tags, { sortBy, descending }),
    [rows, tags, sortBy, descending],
  );

  // Sorting and pagination are controlled by the URL, not by react-table
  const controlledSortBy = useMemo(
    () => [{ id: SORT_BY_TO_COLUMN_ID[sortBy], desc: descending }],
    [sortBy, descending],
  );
  const useControlledState = useCallback(
    (state: TableState<BeneficiaryRow>): TableState<BeneficiaryRow> => ({
      ...state,
      sortBy: controlledSortBy,
      pageIndex: currentPage - 1,
      pageSize: PAGE_SIZE,
    }),
    [controlledSortBy, currentPage],
  );

  // Select-all per tab: all beneficiaries matching the filters of the view are selected, including
  // the ones that are not loaded. The selection checkboxes are disabled while it is active.
  // NOTE: The IDs of all beneficiaries of the tab will be fetched once actions consume the selection.
  const [selectAllTabs, setSelectAllTabs] = useState<Record<BeneficiariesTab, boolean>>({
    active: false,
    deactivated: false,
  });
  const isSelectAll = selectAllTabs[tab];
  const isSelectAllRef = useRef(isSelectAll);
  isSelectAllRef.current = isSelectAll;

  const {
    headerGroups,
    prepareRow,
    allColumns,
    state: { hiddenColumns },
    page,
    selectedFlatRows,
    toggleAllRowsSelected,
    dispatch,
  } = useTable<BeneficiaryRow>(
    {
      columns,
      data: tableData,
      getRowId: (row) => row.id,
      initialState: {
        hiddenColumns: tableConfig.getHiddenColumns(),
      },
      manualPagination: true,
      manualSortBy: true,
      disableMultiSort: true,
      autoResetPage: false,
      autoResetSortBy: false,
      autoResetSelectedRows: false,
      pageCount: maxPage,
      useControlledState,
    },
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((col) => [
        {
          id: "selection",
          Header: ({ getToggleAllPageRowsSelectedProps }: CellProps<any, any>) => (
            <IndeterminateCheckbox
              {...getToggleAllPageRowsSelectedProps()}
              disabled={isSelectAllRef.current}
            />
          ),
          Cell: ({ row }: CellProps<any, any>) => (
            <IndeterminateCheckbox
              {...row.getToggleRowSelectedProps()}
              disabled={isSelectAllRef.current}
            />
          ),
        },
        ...col,
      ]);
    },
  );

  const selectedCount = isSelectAll ? (totalNumberOfBeneficiaries ?? 0) : selectedFlatRows.length;

  const resetSelectedRows = useCallback(() => dispatch({ type: "resetSelectedRows" }), [dispatch]);
  const resetSelection = useCallback(() => {
    setSelectAllTabs({ active: false, deactivated: false });
    resetSelectedRows();
  }, [resetSelectedRows]);

  // The selection is reset when the beneficiaries of the view change
  const viewKey = JSON.stringify([baseId, filters, search, sortBy, descending]);
  useEffect(() => {
    resetSelection();
  }, [viewKey, resetSelection]);

  // The row selection is limited to the current page of the current tab, unless select-all is
  // active. In that case, the rows of the new page are selected once they are loaded.
  useEffect(() => {
    if (!isSelectAllRef.current) {
      resetSelectedRows();
    }
  }, [tab, currentPage, resetSelectedRows]);
  useEffect(() => {
    if (isSelectAll) {
      toggleAllRowsSelected(true);
    }
  }, [isSelectAll, tableData, toggleAllRowsSelected]);

  // Only the hidden columns are persisted in the table config
  useEffect(() => {
    if (hiddenColumns !== tableConfig.getHiddenColumns()) {
      tableConfig.setHiddenColumns(hiddenColumns);
    }
  }, [hiddenColumns, tableConfig]);

  // Correct a page that is out of range, e.g. because of a manually edited URL
  useEffect(() => {
    if (totalNumberOfBeneficiaries !== null && currentPage > maxPage) {
      setPage(maxPage, { replace: true });
    }
  }, [totalNumberOfBeneficiaries, currentPage, maxPage, setPage]);

  const filterDisclosure = useDisclosure();

  const handleRemoveFilter = useCallback(
    (key: keyof IBeneficiaryFilters, value?: string) => {
      const current = filters[key];
      setFilters({
        ...filters,
        [key]: Array.isArray(current) ? current.filter((v) => v !== value) : "",
      });
    },
    [filters, setFilters],
  );

  const handleClearFilters = useCallback(
    () =>
      setFilters({
        genders: [],
        tagIds: [],
        excludedTagIds: [],
        createdFrom: "",
        createdTo: "",
        quickFilters: [],
      }),
    [setFilters],
  );

  const handleSortColumn = useCallback(
    (column: HeaderGroup<any>) => {
      const clicked = COLUMN_ID_TO_SORT_BY[column.id];
      if (clicked) {
        setSort(getNextSort({ sortBy, descending }, clicked));
      }
    },
    [setSort, sortBy, descending],
  );

  const columnCount = columns.length + 1;
  const tabTitle = (t: BeneficiariesTab) => {
    const total = rowsOfTabs[t].totalNumberOfBeneficiaries;
    return total === null ? TAB_TITLES[t] : `${TAB_TITLES[t]} (${total})`;
  };
  const totalCount = totalNumberOfBeneficiaries ?? 0;

  const tabContent = (
    <Flex direction="column" height="100%" minHeight={0}>
      <SelectAll
        testId="selected-beneficiaries-counter"
        selectedCount={selectedCount}
        isSelectAll={isSelectAll}
        isLoading={isLoading || totalNumberOfBeneficiaries === null}
        totalCount={totalCount}
        selectedText={`${selectedCount} ${selectedCount === 1 ? "beneficiary" : "beneficiaries"} selected`}
        selectAllText={`Select all ${totalCount} ${totalCount === 1 ? "beneficiary" : "beneficiaries"}`}
        clearText="clear all"
        onSelectAll={() => setSelectAllTabs((previous) => ({ ...previous, [tab]: true }))}
        onClear={resetSelection}
      />
      <Box flex="1" minHeight={0} overflow="auto">
        <Table key="beneficiaries-table">
          <FilteringSortingTableHeader
            headerGroups={headerGroups}
            hideColumnFilters={true}
            onSortColumn={handleSortColumn}
          />
          <Tbody>
            {isLoading && <SkeletonRows columnCount={columnCount} />}

            {!isLoading && page.length === 0 && (
              <Tr>
                <Td colSpan={columnCount} textAlign="center">
                  No beneficiaries registered.
                </Td>
              </Tr>
            )}

            {!isLoading &&
              page.map((row) => {
                prepareRow(row);
                const { groupHeader } = row.original;
                return [
                  groupHeader && (
                    <Tr key={`group-${row.original.id}`} bg="gray.100" data-testid="group-header">
                      <Td colSpan={row.cells.length} fontWeight="bold">
                        {groupHeader.name} ({groupHeader.count})
                      </Td>
                    </Tr>
                  ),
                  <Tr
                    {...row.getRowProps()}
                    key={row.original.id}
                    opacity={tab === "active" && row.original.soonToBeDeactivated ? 0.5 : undefined}
                  >
                    {row.cells.map((cell) => (
                      <Td key={`${row.original.id}-${cell.column.id}`}>{cell.render("Cell")}</Td>
                    ))}
                  </Tr>,
                ];
              })}
          </Tbody>
        </Table>
      </Box>
      <PaginationControls
        currentPage={currentPage}
        maxPage={maxPage}
        isMaxPageLoading={totalNumberOfBeneficiaries === null}
        onPageChange={setPage}
        isNextDisabled={isLoading || isPrefetching}
      />
    </Flex>
  );

  return (
    <Flex direction="column" height="100%">
      <Flex flex="none" alignItems="center" flexWrap="wrap">
        <Spacer />
        <HStack spacing={2} mb={2}>
          <ColumnSelector
            availableColumns={allColumns.filter((column) => column.id !== "selection")}
          />
          <GlobalFilter
            globalFilter={search}
            setGlobalFilter={(value) => setSearch(value ?? "")}
            placeholder="Search"
            syncWithGlobalFilter
          />
          <FilterPanel
            isOpen={filterDisclosure.isOpen}
            onOpen={filterDisclosure.onOpen}
            onClose={filterDisclosure.onClose}
          >
            <BeneficiariesFilter
              isOpen={filterDisclosure.isOpen}
              onClose={filterDisclosure.onClose}
              filters={filters}
              onApplyFilters={setFilters}
              tagOptions={tagOptions}
            />
          </FilterPanel>
        </HStack>
      </Flex>
      <BeneficiaryFilterChips
        filters={filters}
        tagOptions={tagOptions}
        onRemoveFilter={handleRemoveFilter}
        onClearAllFilters={handleClearFilters}
      />
      <Tabs
        index={TABS.indexOf(tab)}
        onChange={(index) => setTab(TABS[index])}
        display="flex"
        flexDirection="column"
        flex="1"
        minHeight={0}
      >
        <TabList flex="none">
          {TABS.map((t) => (
            <Tab key={t}>{tabTitle(t)}</Tab>
          ))}
        </TabList>
        <TabPanels flex="1" minHeight={0}>
          {TABS.map((t) => (
            <TabPanel key={t} height="100%" px={0} pb={0}>
              {t === tab && tabContent}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Flex>
  );
}

export default BeneficiariesTable;
