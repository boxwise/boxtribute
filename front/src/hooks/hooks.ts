import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
  defaultTableConfig: ITableConfig;
  products?: Array<{ id: string; name: string }>;
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

// Helper functions for URL parameter sync
const parseIds = (idsParam: string | null): string[] => {
  if (!idsParam) return [];

  return idsParam
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id && !isNaN(Number(id)));
};

const serializeIds = (filters: string[]): string | null => {
  if (!filters.length) return null;
  return filters.join(",");
};

export const useTableConfig = ({
  tableConfigKey,
  defaultTableConfig,
  products = [],
}: IUseTableConfigProps): IUseTableConfigReturnType => {
  const tableConfigsState = useReactiveVar(tableConfigsVar);
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialMount = useRef(true);

  // Update URL when filters change
  const updateUrl = useCallback(
    (filters: Filters<any>) => {
      const newSearchParams = new URLSearchParams();

      // Handle product filters
      const productFilter = filters.find((f) => f.id === "product");
      if (productFilter && productFilter.value?.length > 0) {
        const productIds = serializeIds(productFilter.value);
        if (productIds) {
          newSearchParams.set("product_ids", productIds);
        }
      }

      // Handle state filters
      const stateFilter = filters.find((f) => f.id === "state");
      if (stateFilter && stateFilter.value?.length > 0) {
        const stateIds = serializeIds(stateFilter.value);
        if (stateIds) {
          newSearchParams.set("state_ids", stateIds);
        }
      }

      // Handle product category filters
      const productCategoryFilter = filters.find((f) => f.id === "productCategory");
      if (productCategoryFilter && productCategoryFilter.value?.length > 0) {
        const productCategoryIds = serializeIds(productCategoryFilter.value);
        if (productCategoryIds) {
          newSearchParams.set("product_category_ids", productCategoryIds);
        }
      }

      // Handle size filters
      const sizeFilter = filters.find((f) => f.id === "size");
      if (sizeFilter && sizeFilter.value?.length > 0) {
        const sizeIds = serializeIds(sizeFilter.value);
        if (sizeIds) {
          newSearchParams.set("size_ids", sizeIds);
        }
      }

      // Handle location filters
      const locationFilter = filters.find((f) => f.id === "location");
      if (locationFilter && locationFilter.value?.length > 0) {
        const locationIds = serializeIds(locationFilter.value);
        if (locationIds) {
          newSearchParams.set("location_ids", locationIds);
        }
      }

      // Only update if something changed
      if (newSearchParams.toString() !== searchParams.toString()) {
        setSearchParams(newSearchParams, { replace: true });
      }
    },
    [searchParams, setSearchParams],
  );

  // Parse URL parameters
  const productIdsParam = searchParams.get("product_ids");
  const stateIdsParam = searchParams.get("state_ids");
  const productCategoryIdsParam = searchParams.get("product_category_ids");
  const sizeIdsParam = searchParams.get("size_ids");
  const locationIdsParam = searchParams.get("location_ids");

  // Parse filters from URL
  const urlProductFilters = useMemo(() => parseIds(productIdsParam), [productIdsParam, products]);
  const urlStateFilters = useMemo(() => parseIds(stateIdsParam), [stateIdsParam]);
  const urlProductCategoryFilters = useMemo(
    () => parseIds(productCategoryIdsParam),
    [productCategoryIdsParam],
  );
  const urlSizeFilters = useMemo(() => parseIds(sizeIdsParam), [sizeIdsParam]);
  const urlLocationFilters = useMemo(() => parseIds(locationIdsParam), [locationIdsParam]);

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

    // Add product category filter if URL has product_category_ids
    if (urlProductCategoryFilters.length > 0) {
      initialColumnFilters = initialColumnFilters.filter(
        (filter) => filter.id !== "productCategory",
      );
      initialColumnFilters.push({ id: "productCategory", value: urlProductCategoryFilters });
    }

    // Add size filter if URL has size_ids
    if (urlSizeFilters.length > 0) {
      initialColumnFilters = initialColumnFilters.filter((filter) => filter.id !== "size");
      initialColumnFilters.push({ id: "size", value: urlSizeFilters });
    }

    // Add location filter if URL has location_ids
    if (urlLocationFilters.length > 0) {
      initialColumnFilters = initialColumnFilters.filter((filter) => filter.id !== "location");
      initialColumnFilters.push({ id: "location", value: urlLocationFilters });
    }
    console.log(initialColumnFilters);

    const tableConfig: ITableConfig = {
      globalFilter: defaultTableConfig.globalFilter,
      columnFilters: initialColumnFilters,
      sortBy: defaultTableConfig.sortBy,
      hiddenColumns: defaultTableConfig.hiddenColumns,
    };
    tableConfigsState.set(tableConfigKey, tableConfig);
    tableConfigsVar(tableConfigsState);
  }

  // Sync default filters to URL on first load if no URL parameters present
  useEffect(() => {
    if (isInitialMount.current) {
      const hasUrlParams =
        productIdsParam ||
        stateIdsParam ||
        productCategoryIdsParam ||
        sizeIdsParam ||
        locationIdsParam;
      if (!hasUrlParams) {
        const currentConfig = tableConfigsState.get(tableConfigKey);
        if (currentConfig?.columnFilters) {
          updateUrl(currentConfig.columnFilters);
        }
      }
      isInitialMount.current = false;
    }
  }, [
    productIdsParam,
    stateIdsParam,
    productCategoryIdsParam,
    sizeIdsParam,
    locationIdsParam,
    tableConfigKey,
    tableConfigsState,
    updateUrl,
  ]);

  // Note: URL sync happens via setColumnFilters when filters change through UI

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
