import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IFilterValue } from "../filter/ValueFilter";

export default function useValueFilter<T>(
  values: (IFilterValue & T)[],
  defaultFilterValue: IFilterValue & T,
  filterId: string,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterValue, setFilterValue] = useState<IFilterValue & T>(defaultFilterValue);

  useEffect(() => {
    const param = searchParams.get(filterId);
    setFilterValue(values.find((fV) => fV.urlId === param) ?? defaultFilterValue);
  }, [searchParams, filterId, values, defaultFilterValue]);

  const onFilterChange = (event) => {
    const selected = event as IFilterValue;

    if (searchParams.get(filterId)) {
      searchParams.delete(filterId);
    }

    searchParams.append(filterId, selected.urlId);

    setSearchParams(searchParams);
  };

  return { onFilterChange, filterValue };
}
