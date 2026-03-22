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

function useMultiSelectFilter<T>(
  values: (IFilterValue & T)[],
  filterId: string,
): { onFilterChange: (event: (IFilterValue & T)[]) => void; filterValue: (IFilterValue & T)[] } {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterValue, setFilterValue] = useState<(IFilterValue & T)[]>([]);

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

  return { onFilterChange, filterValue };
}

export default useMultiSelectFilter;
