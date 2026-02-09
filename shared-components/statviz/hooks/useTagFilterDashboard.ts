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

/**
 * Hook for managing tag filter state with included and excluded tags.
 * Synchronizes state with URL parameters:
 * - `tags` parameter for included tags
 * - `notags` parameter for excluded tags
 *
 * @param includedValues - Available tag values for inclusion
 * @param excludedValues - Available tag values for exclusion
 * @param includedFilterId - URL parameter name for included tags (default: "tags")
 * @param excludedFilterId - URL parameter name for excluded tags (default: "notags")
 * @returns Object containing filter values and change handlers for both included and excluded tags
 */
export default function useTagFilterDashboard<T>(
  includedValues: (IFilterValue & T)[],
  excludedValues: (IFilterValue & T)[],
  includedFilterId: string = "tags",
  excludedFilterId: string = "notags",
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [includedFilterValue, setIncludedFilterValue] = useState<(IFilterValue & T)[]>([]);
  const [excludedFilterValue, setExcludedFilterValue] = useState<(IFilterValue & T)[]>([]);

  // Sync included tags from URL
  useEffect(() => {
    const param = searchParams.get(includedFilterId);
    if (param !== null) {
      setIncludedFilterValue(urlFilterValuesDecode(param, includedValues));
    } else {
      setIncludedFilterValue([]);
    }
  }, [searchParams, includedFilterId, includedValues]);

  // Sync excluded tags from URL
  useEffect(() => {
    const param = searchParams.get(excludedFilterId);
    if (param !== null) {
      setExcludedFilterValue(urlFilterValuesDecode(param, excludedValues));
    } else {
      setExcludedFilterValue([]);
    }
  }, [searchParams, excludedFilterId, excludedValues]);

  const onIncludedFilterChange = (event: (IFilterValue & T)[]) => {
    const selected = event;
    const newParams = new URLSearchParams(searchParams);

    if (selected.length === 0) {
      newParams.delete(includedFilterId);
    } else {
      newParams.set(includedFilterId, urlFilterValuesEncode(selected));
      trackFilter({ filterId: includedFilterId, value: selected[selected.length - 1].label });
    }

    setSearchParams(newParams);
  };

  const onExcludedFilterChange = (event: (IFilterValue & T)[]) => {
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

  return {
    includedFilterValue,
    excludedFilterValue,
    onIncludedFilterChange,
    onExcludedFilterChange,
  };
}
