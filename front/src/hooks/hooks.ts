import { useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { tableConfigsVar } from "queries/cache";
import { useReactiveVar } from "@apollo/client";
import { Filters, SortingRule } from "react-table";
import { useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";

// logout handler that redirect the v2 to dropapp related trello: https://trello.com/c/sbIJYHFF
export const useHandleLogout = () => {
  const { user, logout } = useAuth0();

  const handleLogout = () => {
    // Clear reconciliation view form input cache.
    localStorage.removeItem("reconciliationMatchProduct");
    localStorage.removeItem("reconciliationReceiveLocation");

    // only redirect in staging and production environments
    if (import.meta.env.FRONT_ENVIRONMENT !== "development") {
      window.location.href = `${import.meta.env.FRONT_OLD_APP_BASE_URL}/index.php?action=logoutfromv2`;
    } else {
      logout();
    }
    return null;
  };
  return { user, handleLogout };
};

export const useGetUrlForResourceHelpers = () => {
  const baseId = useAtomValue(selectedBaseIdAtom);
  if (baseId == null) {
    throw new Error("Could not extract baseId from URL");
  }

  const getBaseRootUrlForCurrentBase = () => `/bases/${baseId}`;

  const getDistroSpotDetailUrlById = (distroSpotId: string) =>
    `/bases/${baseId}/distributions/spots/${distroSpotId}`;

  const getDistroEventDetailUrlById = (distroEventId: string) =>
    `/bases/${baseId}/distributions/events/${distroEventId}`;

  const getBoxDetailViewUrlByLabelIdentifier = (labelIdentifier: string) =>
    `/bases/${baseId}/boxes/${labelIdentifier}`;

  return {
    getBaseId: () => baseId,
    getDistroSpotDetailUrlById,
    getDistroEventDetailUrlById,
    getBaseRootUrlForCurrentBase,
    getBoxDetailViewUrlByLabelIdentifier,
  };
};

export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);
  return [value, toggle] as [boolean, () => void];
};

// TODO: Probably need to refactor to remove this, seems unnecessary.
export const useGlobalSiteState = () => {
  const currentBaseId = useAtomValue(selectedBaseIdAtom);
  const navigate = useNavigate();

  return {
    currentBaseId,
    navigate,
  };
};

export interface ITableConfig {
  globalFilter?: string;
  columnFilters: Filters<any>;
  sortBy: SortingRule<any>[];
  hiddenColumns?: string[];
}

interface IUseTableConfigProps {
  tableConfigKey: string;
  defaultTableConfig?: ITableConfig;
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

export const useTableConfig = ({
  tableConfigKey,
  defaultTableConfig,
}: IUseTableConfigProps): IUseTableConfigReturnType => {
  const tableConfigsState = useReactiveVar(tableConfigsVar);
  // TODO: save table config in url to make it easily shareable and persistable across sessions
  // Problem: setSearchParams of the useSearchParams hook from react-router-dom
  // is causing a rerender of all components that are depending on parts of the url,
  // e.g. being accessed by useLocation hook or the useParams hook.
  // The react-router-dom team is aware of this issue and is working on a solution.
  // Alternatively, we could try out use-query-params library.
  const [searchParams] = useSearchParams();

  // Intialization
  if (!tableConfigsState.has(tableConfigKey) && defaultTableConfig) {
    const tableConfig: ITableConfig = {
      globalFilter: defaultTableConfig.globalFilter,
      columnFilters: searchParams.get("columnFilters")
        ? JSON.parse(searchParams.get("columnFilters") || "")
        : defaultTableConfig.columnFilters,
      sortBy: defaultTableConfig.sortBy,
      hiddenColumns: defaultTableConfig.hiddenColumns,
    };
    tableConfigsState.set(tableConfigKey, tableConfig);
    tableConfigsVar(tableConfigsState);
    // const newSearchParams = new URLSearchParams();
    // newSearchParams.set("columnFilters", JSON.stringify(tableConfig.columnFilters));
    // setSearchParams(newSearchParams.toString());
  }

  function getGlobalFilter() {
    return tableConfigsState.get(tableConfigKey)?.globalFilter;
  }

  function getColumnFilters() {
    return tableConfigsState.get(tableConfigKey)!.columnFilters;
  }

  function getSortBy() {
    return tableConfigsState.get(tableConfigKey)!.sortBy;
  }

  function getHiddenColumns() {
    return tableConfigsState.get(tableConfigKey)?.hiddenColumns;
  }

  function setGlobalFilter(globalFilter: string | undefined) {
    const tableConfig = tableConfigsState.get(tableConfigKey);
    tableConfig!.globalFilter = globalFilter;
    tableConfigsState.set(tableConfigKey, tableConfig!);
    tableConfigsVar(tableConfigsState);
  }

  function setColumnFilters(columnFilters: Filters<any>) {
    const tableConfig = tableConfigsState.get(tableConfigKey);
    tableConfig!.columnFilters = columnFilters;
    tableConfigsState.set(tableConfigKey, tableConfig!);
    tableConfigsVar(tableConfigsState);
  }

  function setSortBy(sortBy: SortingRule<any>[]) {
    const tableConfig = tableConfigsState.get(tableConfigKey);
    tableConfig!.sortBy = sortBy;
    tableConfigsState.set(tableConfigKey, tableConfig!);
    tableConfigsVar(tableConfigsState);
  }

  function setHiddenColumns(hiddenColumns: string[] | undefined) {
    const tableConfig = tableConfigsState.get(tableConfigKey);
    tableConfig!.hiddenColumns = hiddenColumns;
    tableConfigsState.set(tableConfigKey, tableConfig!);
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
