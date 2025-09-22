import { useReactiveVar } from "@apollo/client";
import { tableConfigsVar } from "queries/cache";
import { useCallback, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Filters, SortingRule } from "react-table";

export interface ITableConfig {
  globalFilter?: string;
  columnFilters: Filters<any>;
  sortBy: SortingRule<any>[];
  hiddenColumns?: string[];
}

interface IUseTableConfigProps {
  tableConfigKey: string;
  defaultTableConfig: ITableConfig;
  syncFiltersAndUrlParams?: boolean;
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

// Configuration for URL parameter mapping
const URL_FILTER_CONFIG = [
  { filterId: "product", urlParam: "product_ids" },
  { filterId: "state", urlParam: "state_ids" },
  { filterId: "gender", urlParam: "gender_ids" },
  { filterId: "productCategory", urlParam: "product_category_ids" },
  { filterId: "size", urlParam: "size_ids" },
  { filterId: "location", urlParam: "location_ids" },
  { filterId: "tags", urlParam: "tag_ids" },
] as const;

// Helper to update URL parameters from filters
const updateUrlFromFilters = (
  filters: Filters<any>,
  searchParams: URLSearchParams,
  setSearchParams: (params: URLSearchParams, options?: { replace?: boolean }) => void,
) => {
  const newSearchParams = new URLSearchParams();

  // Process each filter type using configuration
  URL_FILTER_CONFIG.forEach(({ filterId, urlParam }) => {
    const filter = filters.find((f) => f.id === filterId);
    if (filter && filter.value?.length > 0) {
      const serializedIds = serializeIds(filter.value);
      if (serializedIds) {
        newSearchParams.set(urlParam, serializedIds);
      }
    }
  });

  // Only update if something changed
  if (newSearchParams.toString() !== searchParams.toString()) {
    setSearchParams(newSearchParams, { replace: true });
  }
};

// Helper to parse URL parameters into filters
const parseUrlFilters = (searchParams: URLSearchParams) => {
  const urlFilters: Record<string, string[]> = {};

  URL_FILTER_CONFIG.forEach(({ filterId, urlParam }) => {
    const param = searchParams.get(urlParam);
    urlFilters[filterId] = parseIds(param);
  });

  return urlFilters;
};

// Helper to create initial column filters from URL and defaults
const createInitialColumnFilters = (
  defaultColumnFilters: Filters<any>,
  urlFilters: Record<string, string[]>,
): Filters<any> => {
  let initialColumnFilters = [...defaultColumnFilters];

  // Process each filter type using configuration
  URL_FILTER_CONFIG.forEach(({ filterId }) => {
    const urlFilterValue = urlFilters[filterId];
    if (urlFilterValue && urlFilterValue.length > 0) {
      // Remove existing filter of this type
      initialColumnFilters = initialColumnFilters.filter((filter) => filter.id !== filterId);
      // Add new filter with URL values
      initialColumnFilters.push({ id: filterId, value: urlFilterValue });
    }
  });

  return initialColumnFilters;
};

export const useTableConfig = ({
  tableConfigKey,
  defaultTableConfig,
  syncFiltersAndUrlParams = false,
}: IUseTableConfigProps): IUseTableConfigReturnType => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Parse all URL filters using helper
  const urlFilters = useMemo(() => parseUrlFilters(searchParams), [searchParams]);
  const tableConfigsState = useReactiveVar(tableConfigsVar);

  const isInitialMount = useRef(true);

  // Update URL when filters change
  const updateUrl = useCallback(
    (filters: Filters<any>) => {
      updateUrlFromFilters(filters, searchParams, setSearchParams);
    },
    [searchParams, setSearchParams],
  );

  // Sync default filters to URL on first load if no URL parameters present
  useEffect(() => {
    if (isInitialMount.current && syncFiltersAndUrlParams) {
      const hasUrlParams = URL_FILTER_CONFIG.some(({ urlParam }) => searchParams.get(urlParam));

      if (!hasUrlParams) {
        const currentConfig = tableConfigsState.get(tableConfigKey);
        if (currentConfig?.columnFilters) {
          updateUrl(currentConfig.columnFilters);
        }
      } else {
        // Create initial column filters, prioritizing URL parameters
        const initialColumnFilters = createInitialColumnFilters(
          defaultTableConfig.columnFilters,
          urlFilters,
        );

        const tableConfig: ITableConfig = {
          globalFilter: defaultTableConfig.globalFilter,
          columnFilters: initialColumnFilters,
          sortBy: defaultTableConfig.sortBy,
          hiddenColumns: defaultTableConfig.hiddenColumns,
        };
        tableConfigsState.set(tableConfigKey, tableConfig);
        tableConfigsVar(tableConfigsState);
      }

      isInitialMount.current = false;
    }
  }, [
    syncFiltersAndUrlParams,
    searchParams,
    tableConfigKey,
    tableConfigsState,
    updateUrl,
    defaultTableConfig,
    urlFilters,
  ]);

  // Note: URL sync happens via setColumnFilters when filters change through UI

  function getGlobalFilter() {
    return tableConfigsState.get(tableConfigKey)?.globalFilter;
  }

  function getColumnFilters() {
    return (tableConfigsState.get(tableConfigKey) || defaultTableConfig).columnFilters;
  }

  function getSortBy() {
    return (tableConfigsState.get(tableConfigKey) || defaultTableConfig).sortBy;
  }

  function getHiddenColumns() {
    return tableConfigsState.get(tableConfigKey)?.hiddenColumns;
  }

  function setGlobalFilter(globalFilter: string | undefined) {
    const tableConfig = tableConfigsState.get(tableConfigKey) || defaultTableConfig;
    tableConfig.globalFilter = globalFilter;
    tableConfigsState.set(tableConfigKey, tableConfig);
    tableConfigsVar(tableConfigsState);
  }

  function setColumnFilters(columnFilters: Filters<any>) {
    const tableConfig = tableConfigsState.get(tableConfigKey) || defaultTableConfig;
    tableConfig.columnFilters = columnFilters;
    tableConfigsState.set(tableConfigKey, tableConfig);
    tableConfigsVar(tableConfigsState);

    // Update URL parameters
    if (syncFiltersAndUrlParams) updateUrl(columnFilters);
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
