import { useEffect, useMemo } from "react";
import { useReactiveVar } from "@apollo/client";
import { TidyFn, filter, tidy } from "@tidyjs/tidy";
import useTimerange from "../../../hooks/useTimerange";
import { MovedBoxesData, MovedBoxesResult } from "../../../../types/generated/graphql";
import { filterListByInterval } from "../../../../utils/helpers";
import MovedBoxesCharts from "./MovedBoxesCharts";
import useValueFilter from "../../../hooks/useValueFilter";
import {
  boxesOrItemsFilterValues,
  boxesOrItemsUrlId,
  defaultBoxesOrItems,
} from "../../filter/BoxesOrItemsSelect";
import useMultiSelectFilter from "../../../hooks/useMultiSelectFilter";
import { genderFilterId, genders, productFilterId } from "../../filter/GenderProductFilter";
import { tagFilterId } from "../../filter/TagFilter";
import {
  targetFilterValuesVar,
  productFilterValuesVar,
  tagFilterValuesVar,
} from "../../../state/filter";
import { targetFilterId, targetToFilterValue } from "../../filter/LocationFilter";

interface IMovedBoxesFilterContainerProps {
  movedBoxes: MovedBoxesData;
}

export default function MovedBoxesFilterContainer({ movedBoxes }: IMovedBoxesFilterContainerProps) {
  const { interval } = useTimerange();

  const { filterValue } = useValueFilter(
    boxesOrItemsFilterValues,
    defaultBoxesOrItems,
    boxesOrItemsUrlId,
  );

  const productsFilterValues = useReactiveVar(productFilterValuesVar);
  const tagFilterValues = useReactiveVar(tagFilterValuesVar);
  const targetFilterValues = useReactiveVar(targetFilterValuesVar);

  const { filterValue: productsFilter } = useMultiSelectFilter(
    productsFilterValues,
    productFilterId,
  );

  const { filterValue: genderFilter } = useMultiSelectFilter(genders, genderFilterId);
  const { filterValue: filteredTags } = useMultiSelectFilter(tagFilterValues, tagFilterId);
  const { filterValue: excludedTargets } = useMultiSelectFilter(targetFilterValues, targetFilterId);

  // fill target filter with data
  useEffect(() => {
    const targets = movedBoxes.dimensions!.target!.map((t) => targetToFilterValue(t!));
    targetFilterValuesVar(targets);
  }, [movedBoxes.dimensions]);

  const movedBoxesFacts = useMemo(() => {
    try {
      return filterListByInterval(
        movedBoxes.facts as MovedBoxesResult[],
        "movedOn",
        interval,
      ) as MovedBoxesResult[];
    } catch (error) {
      // TODO show toast with error message?
    }
    return [];
  }, [interval, movedBoxes.facts]);

  const filteredFacts = useMemo(() => {
    const filters: TidyFn<object, object>[] = [];
    if (genderFilter.length > 0) {
      filters.push(
        filter(
          (fact: MovedBoxesResult) =>
            genderFilter.find((fPG) => fPG.value === fact.gender?.valueOf()!) !== undefined,
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
    if (excludedTargets.length > 0) {
      filters.push(
        filter(
          (fact: MovedBoxesResult) =>
            excludedTargets.find((filteredTarget) => filteredTarget.id! === fact.targetId!) ===
            undefined,
        ),
      );
    }

    if (filteredTags.length > 0) {
      filters.push(
        filter((fact: MovedBoxesResult) => filteredTags.some((fT) => fact.tagIds!.includes(fT.id))),
      );
    }

    if (filters.length > 0) {
      // @ts-expect-error
      return tidy(movedBoxesFacts, ...filters);
    }
    return movedBoxesFacts;
  }, [excludedTargets, filteredTags, genderFilter, movedBoxesFacts, productsFilter]);

  const filteredMovedBoxesCube = {
    facts: filteredFacts as MovedBoxesResult[],
    dimensions: movedBoxes.dimensions,
  };
  return <MovedBoxesCharts movedBoxes={filteredMovedBoxesCube} boxesOrItems={filterValue.value} />;
}
