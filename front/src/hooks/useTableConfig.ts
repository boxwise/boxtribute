import { useReactiveVar } from "@apollo/client";
import { tableConfigsVar } from "queries/cache";
import { useCallback, useMemo, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filters, SortingRule } from "react-table";
import { boxStateIds } from "utils/constants";

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
  isNotMounted: boolean;
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
// TODO: if we need to generlaize this for other tables, this should become a variable of the hook
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
  const urlFilters = useMemo(() => {
    // Validate state_ids are part of known states
    const urlFilters = parseUrlFilters(searchParams);
    if (urlFilters.state?.length > 0) {
      urlFilters.state = urlFilters.state.filter((stateId) =>
        Object.values(boxStateIds).includes(stateId),
      );
    }
    return urlFilters;
  }, [searchParams]);

  // Compute the initial filters if there is no saved config
  const initialColumnFilters = useMemo(() => {
    if (!syncFiltersAndUrlParams) return defaultTableConfig.columnFilters;

    // If URL params exist, merge them into defaults (URL wins)
    const hasUrlParams = URL_FILTER_CONFIG.some(({ urlParam }) => searchParams.get(urlParam));
    return hasUrlParams
      ? createInitialColumnFilters(defaultTableConfig.columnFilters, urlFilters)
      : defaultTableConfig.columnFilters;
  }, [defaultTableConfig.columnFilters, syncFiltersAndUrlParams, searchParams, urlFilters]);

  const tableConfigsState = useReactiveVar(tableConfigsVar);

  // Use state so changes cause a re-render and callers pick up the updated isNotMounted value
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Update URL when filters change
  const updateUrl = useCallback(
    (filters: Filters<any>) => {
      updateUrlFromFilters(filters, searchParams, setSearchParams);
    },
    [searchParams, setSearchParams],
  );

  const updateHiddenColumns = (args: {
    columnFilters: Filters<any>;
    hiddenColumns: string[] | undefined;
  }) => {
    const { hiddenColumns, columnFilters } = args;
    let newHiddenColumns = [...(hiddenColumns || [])];

    columnFilters.forEach((filter) => {
      newHiddenColumns = newHiddenColumns?.filter((col) => col !== filter.id);
    });

    return newHiddenColumns;
  };

  /* Initial mount logic (one-time):
   *
   * - We compute `initialColumnFilters` earlier so callers can synchronously read
   *   URL-applied filters from the getters during render (avoids the race where
   *   react-table/queries initialize with defaults before the effect runs).
   *
   * - Here in the effect we persist a table config only if there is no existing
   *   saved config for the key. This avoids stomping user-saved settings on first load.
   *
   * - If URL params exist, we persist the URL-merged filters (URL wins over defaults).
   *   If the URL is empty and there's no saved config, we persist the default filters
   *   (and write them into the URL via the existing updateUrl logic).
   *
   * - Important: we avoid performing any synchronous state mutation during render.
   *   The getters return the precomputed values and this effect performs the side
   *   effect of persisting them after mount. This pattern prevents the race that
   *   previously caused initial queries to use the default "InStock" filter even
   *   when the URL requested e.g. "Donated".
   */
  useEffect(() => {
    if (isInitialMount && syncFiltersAndUrlParams) {
      const hasUrlParams = URL_FILTER_CONFIG.some(({ urlParam }) => searchParams.get(urlParam));
      const existingConfig = tableConfigsState.get(tableConfigKey);
      if (!existingConfig) {
        const initialFiltersToPersist = hasUrlParams
          ? initialColumnFilters
          : defaultTableConfig.columnFilters;

        // Clone default config to avoid mutation
        const tableConfig: ITableConfig = {
          globalFilter: defaultTableConfig.globalFilter,
          columnFilters: initialFiltersToPersist,
          sortBy: defaultTableConfig.sortBy,
          hiddenColumns: defaultTableConfig.hiddenColumns,
        };

        tableConfig.hiddenColumns = updateHiddenColumns({
          columnFilters: initialFiltersToPersist,
          hiddenColumns: tableConfig.hiddenColumns,
        });

        tableConfigsState.set(tableConfigKey, tableConfig);
        tableConfigsVar(tableConfigsState);
      } else if (!hasUrlParams) {
        // If URL is empty, write the default filters into the URL
        updateUrl(existingConfig.columnFilters);

        // Clone config before updating
        const newConfig: ITableConfig = {
          globalFilter: existingConfig.globalFilter,
          columnFilters: existingConfig.columnFilters,
          sortBy: existingConfig.sortBy,
          hiddenColumns: existingConfig.hiddenColumns,
        };

        newConfig.hiddenColumns = updateHiddenColumns({
          columnFilters: newConfig.columnFilters,
          hiddenColumns: newConfig.hiddenColumns,
        });

        tableConfigsState.set(tableConfigKey, newConfig);
        tableConfigsVar(tableConfigsState);
      }

      // mark initial mount complete and trigger a re-render so consumers see the change
      setIsInitialMount(false);
    }
    // Intentionally disable exhaustive-deps: this effect is meant to run only once on initial mount.
    // The dependencies intentionally included are: syncFiltersAndUrlParams, searchParams, tableConfigKey, tableConfigsState, updateUrl, defaultTableConfig, urlFilters, initialColumnFilters.
    // These values are stable/memoized by design. Adding all inferred deps would cause unwanted re-runs; update dependencies intentionally if behavior changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    syncFiltersAndUrlParams,
    searchParams,
    tableConfigKey,
    tableConfigsState,
    updateUrl,
    defaultTableConfig,
    urlFilters,
    initialColumnFilters,
  ]);

  // Note: URL sync happens via setColumnFilters when filters change through UI

  function getGlobalFilter() {
    const cfg = tableConfigsState.get(tableConfigKey);
    return cfg?.globalFilter ?? defaultTableConfig.globalFilter;
  }

  function getColumnFilters() {
    const cfg = tableConfigsState.get(tableConfigKey);
    return cfg?.columnFilters ?? initialColumnFilters;
  }

  function getSortBy() {
    const cfg = tableConfigsState.get(tableConfigKey);
    return cfg?.sortBy ?? defaultTableConfig.sortBy;
  }

  function getHiddenColumns() {
    const cfg = tableConfigsState.get(tableConfigKey);
    if (cfg?.hiddenColumns !== undefined) return cfg.hiddenColumns;

    const hiddenColumns = updateHiddenColumns({
      columnFilters: initialColumnFilters,
      hiddenColumns: defaultTableConfig.hiddenColumns,
    });

    return hiddenColumns;
  }

  function setGlobalFilter(globalFilter: string | undefined) {
    const tableConfig = tableConfigsState.get(tableConfigKey) || defaultTableConfig;
    tableConfig.globalFilter = globalFilter;
    tableConfigsState.set(tableConfigKey, tableConfig);
    tableConfigsVar(tableConfigsState);
  }

  function setColumnFilters(columnFilters: Filters<any>) {
    // Clone config to avoid mutation
    const prevConfig = tableConfigsState.get(tableConfigKey) || defaultTableConfig;
    const tableConfig: ITableConfig = {
      globalFilter: prevConfig.globalFilter,
      columnFilters,
      sortBy: prevConfig.sortBy,
      hiddenColumns: prevConfig.hiddenColumns,
    };

    // Filter hiddenColumns based on filters
    columnFilters.forEach((filter) => {
      tableConfig.hiddenColumns = tableConfig.hiddenColumns?.filter((col) => col !== filter.id);
    });

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
    isNotMounted: isInitialMount,
  };
};
