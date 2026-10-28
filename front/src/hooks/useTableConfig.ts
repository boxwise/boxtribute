import { useReactiveVar } from "@apollo/client";
import { tableConfigsVar } from "queries/cache";
import { Filters, SortingRule } from "react-table";

export interface ITableConfig {
  globalFilter?: string;
  columnFilters?: Filters<any>;
  sortBy?: SortingRule<any>[];
  hiddenColumns?: string[];
}

interface IUseTableConfigProps {
  tableConfigKey: string;
  defaultTableConfig: ITableConfig;
}

export interface IUseTableConfigReturnType {
  getGlobalFilter: () => string | undefined;
  getColumnFilters: () => Filters<any>;
  getSortBy: () => SortingRule<any>[];
  getHiddenColumns: () => string[] | undefined;
  setGlobalFilter: (globalFilter: string | undefined) => void;
  setColumnFilters: (columnFilters: Filters<any>) => void;
  setSortBy: (sortBy: SortingRule<any>[]) => void;
  setHiddenColumns: (hiddenColumns: string[] | undefined) => void;
}

// Stable references for configs that do not define filters or sorting. The boxes view stores only
// its hidden columns here; its filters, sorting and page live in the URL.
const NO_FILTERS: Filters<any> = [];
const NO_SORTING: SortingRule<any>[] = [];

export const useTableConfig = ({
  tableConfigKey,
  defaultTableConfig,
}: IUseTableConfigProps): IUseTableConfigReturnType => {
  const tableConfigsState = useReactiveVar(tableConfigsVar);

  function getGlobalFilter() {
    const cfg = tableConfigsState.get(tableConfigKey);
    return cfg?.globalFilter ?? defaultTableConfig.globalFilter;
  }

  function getColumnFilters() {
    const cfg = tableConfigsState.get(tableConfigKey);
    return cfg?.columnFilters ?? defaultTableConfig.columnFilters ?? NO_FILTERS;
  }

  function getSortBy() {
    const cfg = tableConfigsState.get(tableConfigKey);
    return cfg?.sortBy ?? defaultTableConfig.sortBy ?? NO_SORTING;
  }

  function getHiddenColumns() {
    const cfg = tableConfigsState.get(tableConfigKey);
    return cfg?.hiddenColumns ?? defaultTableConfig.hiddenColumns;
  }

  function setGlobalFilter(globalFilter: string | undefined) {
    const tableConfig = tableConfigsState.get(tableConfigKey) || defaultTableConfig;
    tableConfig.globalFilter = globalFilter;
    tableConfigsState.set(tableConfigKey, tableConfig);
    tableConfigsVar(tableConfigsState);
  }

  function setColumnFilters(columnFilters: Filters<any>) {
    const prevConfig = tableConfigsState.get(tableConfigKey) || defaultTableConfig;

    tableConfigsState.set(tableConfigKey, {
      globalFilter: prevConfig.globalFilter,
      columnFilters,
      sortBy: prevConfig.sortBy,
      hiddenColumns: prevConfig.hiddenColumns,
    });
    tableConfigsVar(tableConfigsState);
  }

  function setSortBy(sortBy: SortingRule<any>[]) {
    const tableConfig = tableConfigsState.get(tableConfigKey) || defaultTableConfig;
    tableConfig.sortBy = sortBy;
    tableConfigsState.set(tableConfigKey, tableConfig);
    tableConfigsVar(tableConfigsState);
  }

  function setHiddenColumns(hiddenColumns: string[] | undefined) {
    const tableConfig = tableConfigsState.get(tableConfigKey) || defaultTableConfig;
    tableConfig.hiddenColumns = hiddenColumns;
    tableConfigsState.set(tableConfigKey, tableConfig);
    tableConfigsVar(tableConfigsState);
  }

  return {
    getGlobalFilter,
    getColumnFilters,
    getSortBy,
    getHiddenColumns,
    setGlobalFilter,
    setColumnFilters,
    setSortBy,
    setHiddenColumns,
  };
};
