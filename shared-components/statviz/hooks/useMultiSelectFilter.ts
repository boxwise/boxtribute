import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IFilterValue } from "../components/filter/ValueFilter";
import { trackFilter } from "../../utils/heapTracking";

export const urlFilterValuesEncode = <T>(array: (IFilterValue & T)[]): string =>
  array.map((e) => encodeURIComponent(e.urlId)).join(",");

export const urlFilterValuesDecode = <T>(
  array: string,
  values: (IFilterValue & T)[],
): (IFilterValue & T)[] =>
  array.split(",").map((e) => values.find((v) => v.urlId === decodeURIComponent(e))!);

export default function useMultiSelectFilter<T>(
  values: (IFilterValue & T)[],
  filterId: string,
  defaultFilterValues?: (IFilterValue & T)[],
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterValue, setFilterValue] = useState<(IFilterValue & T)[]>(defaultFilterValues ?? []);

  useEffect(() => {
    const param = searchParams.get(filterId);
    if (param !== null) {
      setFilterValue(urlFilterValuesDecode(param, values));
    } else {
      setFilterValue([]);
    }
    if (param === "") {
      searchParams.delete(filterId);
    }
    setSearchParams(searchParams);
  }, [searchParams, filterId, values, defaultFilterValues, setSearchParams]);

  const onFilterChange = (event) => {
    const selected = event as (IFilterValue & T)[];
    if (searchParams.get(filterId) !== null || selected.length === 0) {
      searchParams.delete(filterId);
    }
    if (selected.length > 0) {
      searchParams.append(filterId, urlFilterValuesEncode(selected));
      trackFilter({ filterId, value: selected[selected.length - 1].label });
    }
    setSearchParams(searchParams);
  };

  return { onFilterChange, filterValue };
}
