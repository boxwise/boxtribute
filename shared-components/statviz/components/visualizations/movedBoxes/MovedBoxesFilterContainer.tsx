import { useEffect, useMemo } from "react";
import { useReactiveVar } from "@apollo/client";
import { TidyFn, filter, tidy } from "@tidyjs/tidy";
import useTimerange from "../../../hooks/useTimerange";
import { filterListByInterval } from "../../../../utils/helpers";
import MovedBoxesCharts from "./MovedBoxesCharts";
import useValueFilter from "../../../hooks/useValueFilter";
import {
  boxesOrItemsFilterValues,
  boxesOrItemsUrlId,
  defaultBoxesOrItems,
} from "../../filter/BoxesOrItemsSelect";
import useMultiSelectFilter from "../../../hooks/useMultiSelectFilter";
import {
  genderFilterId,
  genders,
  productFilterId,
  categoryFilterId,
} from "../../filter/GenderProductFilter";
import {
  targetFilterValuesVar,
  productFilterValuesVar,
  tagFilterIncludedValuesVar,
  tagFilterExcludedValuesVar,
  categoryFilterValuesVar,
} from "../../../state/filter";
import { tagFilterIncludedId, tagFilterExcludedId } from "../../filter/TabbedTagFilter";
import { filterByTags } from "../../../utils/filterByTags";
import { targetFilterId, targetToFilterValue } from "../../filter/LocationFilter";
import { MovedBoxes, MovedBoxesResult } from "../../../../../graphql/types";

interface IMovedBoxesFilterContainerProps {
  movedBoxes: MovedBoxes;
}

export default function MovedBoxesFilterContainer({ movedBoxes }: IMovedBoxesFilterContainerProps) {
  const { interval } = useTimerange();

  const { filterValue } = useValueFilter(
    boxesOrItemsFilterValues,
    defaultBoxesOrItems,
    boxesOrItemsUrlId,
  );

  const productsFilterValues = useReactiveVar(productFilterValuesVar);
  const targetFilterValues = useReactiveVar(targetFilterValuesVar);
  const categoryFilterValues = useReactiveVar(categoryFilterValuesVar);

  const { filterValue: productsFilter } = useMultiSelectFilter(
    productsFilterValues,
    productFilterId,
  );

  const { filterValue: genderFilter } = useMultiSelectFilter(genders, genderFilterId);
  const { filterValue: excludedTargets } = useMultiSelectFilter(targetFilterValues, targetFilterId);
  const { filterValue: filterCategories } = useMultiSelectFilter(
    categoryFilterValues,
    categoryFilterId,
  );

  const includedTagFilterValues = useReactiveVar(tagFilterIncludedValuesVar);
  const excludedTagFilterValues = useReactiveVar(tagFilterExcludedValuesVar);
  const { includedFilterValue: includedTags, excludedFilterValue: excludedTags } =
    useMultiSelectFilter(
      includedTagFilterValues,
      tagFilterIncludedId,
      excludedTagFilterValues,
      tagFilterExcludedId,
    );

  // fill target filter with data
  useEffect(() => {
    const targets = movedBoxes?.dimensions!.target!.map((t) => targetToFilterValue(t!));
    targetFilterValuesVar(targets);
  }, [movedBoxes?.dimensions]);

  const movedBoxesFacts = useMemo(() => {
    try {
      return filterListByInterval(movedBoxes?.facts as MovedBoxesResult[], "movedOn", interval);
    } catch (error) {
      console.error(error);
      // TODO show toast with error message?
    }
    return [];
  }, [interval, movedBoxes?.facts]);

  const filteredFacts = useMemo(() => {
    const filters: TidyFn<object, object>[] = [];
    if (genderFilter.length > 0) {
      filters.push(
        filter(
          (fact: MovedBoxesResult) =>
            genderFilter.find((fPG) => fPG.value === fact.gender?.valueOf()) !== undefined,
        ),
      );
    }
    if (productsFilter.length > 0) {
      filters.push(
        filter(
          (fact: MovedBoxesResult) =>
            productsFilter.find(
              (fBP) => fBP?.name.toLowerCase() === fact.productName! && fBP.gender === fact.gender,
            ) !== undefined,
        ),
      );
    }
    if (filterCategories.length > 0) {
      filters.push(
        filter(
          (fact: MovedBoxesResult) =>
            filterCategories.find((fC) => fC?.id === fact.categoryId!) !== undefined,
        ),
      );
    }
    if (excludedTargets.length > 0) {
      filters.push(
        filter(
          (fact: MovedBoxesResult) =>
            excludedTargets.find((filteredTarget) => filteredTarget.id! === fact.targetId!) ===
            undefined,
        ),
      );
    }

    let filtered = movedBoxesFacts;
    if (filters.length > 0) {
      // @ts-expect-error
      filtered = tidy(movedBoxesFacts, ...filters) as MovedBoxesResult[];
    }

    // Apply tag filter (included/excluded)
    filtered = filterByTags(filtered, includedTags, excludedTags);

    return filtered;
  }, [
    excludedTargets,
    genderFilter,
    movedBoxesFacts,
    productsFilter,
    filterCategories,
    includedTags,
    excludedTags,
  ]);

  const filteredMovedBoxesCube = {
    facts: filteredFacts,
    dimensions: movedBoxes?.dimensions,
  };
  return <MovedBoxesCharts movedBoxes={filteredMovedBoxesCube} boxesOrItems={filterValue.value} />;
}
