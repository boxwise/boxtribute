import { UseFormWatch } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

export default function useUpdateListFilter(
  watch: UseFormWatch<any>,
  filterName: string,
  filterKey: string,
) {
  const [searchParams, setSearchParams] = useSearchParams();

  watch((selectedFilterElements) => {
    if (selectedFilterElements[filterKey].length > 0) {
      const filterParams = selectedFilterElements[filterKey].map((e) => e.value).join('","');
      searchParams.delete(filterName);
      searchParams.append(filterName, filterParams);
      setSearchParams(searchParams);
    } else {
      searchParams.delete(filterName);
      setSearchParams(searchParams);
    }
  });
}
