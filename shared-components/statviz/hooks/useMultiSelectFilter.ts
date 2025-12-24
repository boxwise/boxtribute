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

export default function useMultiSelectFilter<T>(
  values: (IFilterValue & T)[],
  filterId: string,
  defaultFilterValues?: (IFilterValue & T)[],
) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive filterValue from searchParams
  const param = searchParams.get(filterId);
  const filterValue =
    param !== null && param !== ""
      ? urlFilterValuesDecode(param, values)
      : (defaultFilterValues ?? []);

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
