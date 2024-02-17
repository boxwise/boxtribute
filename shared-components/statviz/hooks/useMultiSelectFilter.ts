import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IFilterValue } from "../Components/filter/ValueFilter";

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
    if (param) {
      setFilterValue(urlFilterValuesDecode(param, values));
    }
  }, [searchParams, filterId, values, defaultFilterValues]);

  const onFilterChange = (event) => {
    const selected = event as (IFilterValue & T)[];

    if (searchParams.get(filterId)) {
      searchParams.delete(filterId);
    }

    searchParams.append(filterId, urlFilterValuesEncode(selected));

    setSearchParams(searchParams);
  };

  return { onFilterChange, filterValue };
}
