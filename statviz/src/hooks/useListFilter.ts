import { Resolver, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

export default function useListFilter(
  filterName: string,
  filterKey: string,
  elements: Array<object>,
  resolver: Resolver
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filteredElements = searchParams.get(filterName)?.split('","');

  if (filteredElements) {
    if (filteredElements.length === 0) {
      searchParams.delete(filterName);
      setSearchParams(searchParams);
    }
  }

  const values = {
    [filterKey]:
      elements?.filter(
        (element) => filteredElements?.indexOf(element.value) === -1
      ) ?? [],
  };

  const {
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver,
    defaultValues: values,
  });

  watch((selectedFilterElements) => {
    if (selectedFilterElements[filterKey].length > 0) {
      const filterParams = selectedFilterElements[filterKey]
        .map((e) => e.value)
        .join('","');
      searchParams.delete(filterName);
      searchParams.append(filterName, filterParams);
      setSearchParams(searchParams);
    } else {
      searchParams.delete(filterName);
      setSearchParams(searchParams);
    }
  });

  return {
    control,
    watch,
    filteredElements,
    errors,
    isSubmitting,
  };
}

/*
  const {
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(MovedBoxesFilterSchema),
    defaultValues: {
      locations: locations?.filter(
        (loc) => selectedLocations?.indexOf(loc.value) !== -1
      ),
    },
  });

  watch((test: IMovedBoxesFilterOutput) => {
    const locations = searchParams.get("locations");
    if (test.locations.length > 0) {
      const locationsParams = test.locations.map((e) => e.value).join('","');
      searchParams.delete("locations");
      searchParams.append("locations", locationsParams);
      setSearchParams(searchParams);
    } else {
      searchParams.delete("locations");
      setSearchParams(searchParams);
    }
  });
*/
