import { useState, useCallback, useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { tableConfigsVar } from "queries/cache";
import { useReactiveVar } from "@apollo/client";
import { Filters, SortingRule } from "react-table";
import { useAtom, useAtomValue } from "jotai";
import { selectedBaseIdAtom } from "stores/globalPreferenceStore";
import { atomWithLocation } from "jotai-location";
import { boxStateIds } from "utils/constants";

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

// Create location atom for managing URL parameters
const locationAtom = atomWithLocation();

// Helper functions for URL parameter sync
const parseProductIds = (productIdsParam: string | null): Array<{ name: string; id: string }> => {
  if (!productIdsParam) return [];

  return productIdsParam
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id && !isNaN(Number(id)))
    .map((id) => ({ name: `Product ${id}`, id })); // Placeholder name, will be updated by filter
};

const parseStateIds = (stateIdsParam: string | null): Array<{ name: string; id: number }> => {
  if (!stateIdsParam) return [];

  return stateIdsParam
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id && !isNaN(Number(id)))
    .map((id) => {
      const numericId = Number(id);
      const stateName = Object.entries(boxStateIds).find(
        ([, stateId]) => stateId === numericId,
      )?.[0];
      return stateName ? { name: stateName, id: numericId } : null;
    })
    .filter((state): state is { name: string; id: number } => state !== null);
};

const serializeProductIds = (filters: Array<{ name: string; id: string }>): string | null => {
  if (!filters.length) return null;
  return filters.map((f) => f.id).join(",");
};

const serializeStateIds = (filters: Array<{ name: string; id: number }>): string | null => {
  if (!filters.length) return null;
  return filters.map((f) => f.id.toString()).join(",");
};

export const useTableConfig = ({
  tableConfigKey,
  defaultTableConfig,
}: IUseTableConfigProps): IUseTableConfigReturnType => {
  const tableConfigsState = useReactiveVar(tableConfigsVar);
  const [location, setLocation] = useAtom(locationAtom);

  // Update URL when filters change
  const updateUrl = useCallback(
    (filters: Filters<any>) => {
      const newSearchParams = new URLSearchParams(location.searchParams?.toString() || "");

      // Handle product filters
      const productFilter = filters.find((f) => f.id === "product");
      if (productFilter && productFilter.value?.length > 0) {
        const productIds = serializeProductIds(productFilter.value);
        if (productIds) {
          newSearchParams.set("product_ids", productIds);
        } else {
          newSearchParams.delete("product_ids");
        }
      } else {
        newSearchParams.delete("product_ids");
      }

      // Handle state filters
      const stateFilter = filters.find((f) => f.id === "state");
      if (stateFilter && stateFilter.value?.length > 0) {
        const stateIds = serializeStateIds(stateFilter.value);
        if (stateIds) {
          newSearchParams.set("state_ids", stateIds);
        } else {
          newSearchParams.delete("state_ids");
        }
      } else {
        newSearchParams.delete("state_ids");
      }

      // Update location atom
      setLocation((prev) => ({
        ...prev,
        searchParams: newSearchParams,
      }));
    },
    [location.searchParams, setLocation],
  );

  // Parse URL parameters
  const urlParams = location.searchParams || new URLSearchParams();
  const productIdsParam = urlParams.get("product_ids");
  const stateIdsParam = urlParams.get("state_ids");

  // Parse filters from URL
  const urlProductFilters = useMemo(() => parseProductIds(productIdsParam), [productIdsParam]);
  const urlStateFilters = useMemo(() => parseStateIds(stateIdsParam), [stateIdsParam]);

  // Initialization
  if (!tableConfigsState.has(tableConfigKey)) {
    // Create initial column filters, prioritizing URL parameters
    let initialColumnFilters = [...defaultTableConfig.columnFilters];

    // Replace state filter if URL has state_ids
    if (urlStateFilters.length > 0) {
      initialColumnFilters = initialColumnFilters.filter((filter) => filter.id !== "state");
      initialColumnFilters.push({ id: "state", value: urlStateFilters });
    }

    // Add product filter if URL has product_ids
    if (urlProductFilters.length > 0) {
      initialColumnFilters = initialColumnFilters.filter((filter) => filter.id !== "product");
      initialColumnFilters.push({ id: "product", value: urlProductFilters });
    }

    const tableConfig: ITableConfig = {
      globalFilter: defaultTableConfig.globalFilter,
      columnFilters: initialColumnFilters,
      sortBy: defaultTableConfig.sortBy,
      hiddenColumns: defaultTableConfig.hiddenColumns,
    };
    tableConfigsState.set(tableConfigKey, tableConfig);
    tableConfigsVar(tableConfigsState);

    // Sync URL with the initial filters
    updateUrl(initialColumnFilters);
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

    // Update URL parameters
    updateUrl(columnFilters);
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
