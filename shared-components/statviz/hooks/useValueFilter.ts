import { useSearchParams } from "react-router-dom";
import { IFilterValue } from "../components/filter/ValueFilter";
import { trackFilter } from "../utils/analytics/heap";

export default function useValueFilter<T>(
  values: (IFilterValue & T)[],
  defaultFilterValue: IFilterValue & T,
  filterId: string,
) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive the current filter value from URL params instead of using state
  const param = searchParams.get(filterId);
  const filterValue = values.find((fV) => fV.urlId === param) ?? defaultFilterValue;

  const onFilterChange = (event) => {
    const selected = event as IFilterValue;

    if (searchParams.get(filterId)) {
      searchParams.delete(filterId);
    }

    searchParams.append(filterId, selected.urlId);

    setSearchParams(searchParams);
    trackFilter({ filterId, value: selected.label });
  };

  return { onFilterChange, filterValue };
}
