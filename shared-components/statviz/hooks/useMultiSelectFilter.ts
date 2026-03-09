import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IFilterValue } from "../components/filter/ValueFilter";
import { trackFilter } from "../utils/analytics/heap";

export const urlFilterValuesEncode = <T>(array: (IFilterValue & T)[]): string =>
  array.map((e) => encodeURIComponent(e.urlId)).join(",");

export const urlFilterValuesDecode = <T>(
  array: string,
  values: (IFilterValue & T)[],
): (IFilterValue & T)[] =>
  array
    .split(",")
    .map((e) => values.find((v) => v.urlId === decodeURIComponent(e)))
    .filter((v): v is IFilterValue & T => v !== undefined);

// Return type for simple multi-select mode
interface SimpleFilterReturn<T> {
  onFilterChange: (event: (IFilterValue & T)[]) => void;
  filterValue: (IFilterValue & T)[];
}

// Return type for include/exclude mode
interface IncludeExcludeFilterReturn<T> {
  includedFilterValue: (IFilterValue & T)[];
  excludedFilterValue: (IFilterValue & T)[];
  onIncludedFilterChange: (event: (IFilterValue & T)[]) => void;
  onExcludedFilterChange: (event: (IFilterValue & T)[]) => void;
  onClearAll: () => void;
}

/**
 * Hook for managing filter state with optional support for excluded values.
 * Can be used for simple multi-select filters or for include/exclude tag filtering.
 *
 * When excludedValues and excludedFilterId are provided, returns both included and excluded filter values.
 * Otherwise, returns a single filterValue (backward compatible).
 *
 * @param values - Available filter values (for inclusion or single-mode filtering)
 * @param filterId - URL parameter name for the filter
 * @param excludedValues - Optional available values for exclusion
 * @param excludedFilterId - Optional URL parameter name for excluded values
 * @returns Filter values and change handlers
 */
function useMultiSelectFilter<T>(
  values: (IFilterValue & T)[],
  filterId: string,
): SimpleFilterReturn<T>;

function useMultiSelectFilter<T>(
  values: (IFilterValue & T)[],
  filterId: string,
  excludedValues: (IFilterValue & T)[],
  excludedFilterId: string,
): IncludeExcludeFilterReturn<T>;

function useMultiSelectFilter<T>(
  values: (IFilterValue & T)[],
  filterId: string,
  excludedValues?: (IFilterValue & T)[],
  excludedFilterId?: string,
): SimpleFilterReturn<T> | IncludeExcludeFilterReturn<T> {
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine if we're in exclude mode based on the presence of excludedFilterId
  const hasExcludeMode = excludedFilterId !== undefined;

  const [filterValue, setFilterValue] = useState<(IFilterValue & T)[]>([]);
  const [excludedFilterValue, setExcludedFilterValue] = useState<(IFilterValue & T)[]>([]);

  // Sync included/main filter values from URL
  useEffect(() => {
    const param = searchParams.get(filterId);
    if (param !== null) {
      setFilterValue(urlFilterValuesDecode(param, values));
    } else {
      setFilterValue([]);
    }
    if (param === "") {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete(filterId);
      setSearchParams(newParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, filterId, values]);

  // Sync excluded filter values from URL (only in exclude mode)
  useEffect(() => {
    if (!hasExcludeMode || !excludedFilterId || !excludedValues) return;

    const param = searchParams.get(excludedFilterId);
    if (param !== null) {
      setExcludedFilterValue(urlFilterValuesDecode(param, excludedValues));
    } else {
      setExcludedFilterValue([]);
    }
    if (param === "") {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete(excludedFilterId);
      setSearchParams(newParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, excludedFilterId, excludedValues, hasExcludeMode]);

  const onFilterChange = (event: (IFilterValue & T)[]) => {
    const selected = event;
    const newParams = new URLSearchParams(searchParams);

    if (selected.length === 0) {
      newParams.delete(filterId);
    } else {
      newParams.set(filterId, urlFilterValuesEncode(selected));
      trackFilter({ filterId, value: selected[selected.length - 1].label });
    }

    setSearchParams(newParams);
  };

  const onExcludedFilterChange = (event: (IFilterValue & T)[]) => {
    if (!hasExcludeMode || !excludedFilterId) return;

    const selected = event;
    const newParams = new URLSearchParams(searchParams);

    if (selected.length === 0) {
      newParams.delete(excludedFilterId);
    } else {
      newParams.set(excludedFilterId, urlFilterValuesEncode(selected));
      trackFilter({ filterId: excludedFilterId, value: selected[selected.length - 1].label });
    }

    setSearchParams(newParams);
  };

  const onClearAll = () => {
    if (!hasExcludeMode || !excludedFilterId) return;

    const newParams = new URLSearchParams(searchParams);
    newParams.delete(filterId);
    newParams.delete(excludedFilterId);
    setSearchParams(newParams);
  };

  // Return different shapes based on whether exclude mode is enabled
  if (hasExcludeMode) {
    return {
      includedFilterValue: filterValue,
      excludedFilterValue,
      onIncludedFilterChange: onFilterChange,
      onExcludedFilterChange,
      onClearAll,
    } as IncludeExcludeFilterReturn<T>;
  }

  // Backward compatible return for simple multi-select
  return { onFilterChange, filterValue } as SimpleFilterReturn<T>;
}

export default useMultiSelectFilter;
