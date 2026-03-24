import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IFilterValue } from "../components/filter/ValueFilter";
import { trackFilter } from "../utils/analytics/heap";
import { urlFilterValuesDecode, urlFilterValuesEncode } from "./useMultiSelectFilter";

function useIncludeExcludeFilter<T>(
  includedValues: (IFilterValue & T)[],
  includedFilterId: string,
  excludedValues: (IFilterValue & T)[],
  excludedFilterId: string,
): {
  includedFilterValue: (IFilterValue & T)[];
  excludedFilterValue: (IFilterValue & T)[];
  onIncludedFilterChange: (event: (IFilterValue & T)[]) => void;
  onExcludedFilterChange: (event: (IFilterValue & T)[]) => void;
  onClearAll: () => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const [includedFilterValue, setIncludedFilterValue] = useState<(IFilterValue & T)[]>([]);
  const [excludedFilterValue, setExcludedFilterValue] = useState<(IFilterValue & T)[]>([]);

  useEffect(() => {
    const param = searchParams.get(includedFilterId);
    if (param !== null) {
      setIncludedFilterValue(urlFilterValuesDecode(param, includedValues));
    } else {
      setIncludedFilterValue([]);
    }
    if (param === "") {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete(includedFilterId);
      setSearchParams(newParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, includedFilterId, includedValues]);

  useEffect(() => {
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

  const onClearAll = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(includedFilterId);
    newParams.delete(excludedFilterId);
    setSearchParams(newParams);
  };

  return {
    includedFilterValue,
    excludedFilterValue,
    onIncludedFilterChange,
    onExcludedFilterChange,
    onClearAll,
  };
}

export default useIncludeExcludeFilter;
