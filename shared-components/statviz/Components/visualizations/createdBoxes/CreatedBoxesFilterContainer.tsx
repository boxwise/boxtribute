import { useMemo } from "react";
import { TidyFn, filter, tidy } from "@tidyjs/tidy";
import { CreatedBoxesData, CreatedBoxesResult } from "../../../../types/generated/graphql";
import CreatedBoxesCharts from "./CreatedBoxesCharts";
import { filterListByInterval } from "../../../../utils/helpers";
import useTimerange from "../../../hooks/useTimerange";
import useValueFilter from "../../../hooks/useValueFilter";
import {
  IBoxesOrItemsFilter,
  boxesOrItemsFilterValues,
  boxesOrItemsUrlId,
  defaultBoxesOrItems,
} from "../../filter/BoxesOrItemsSelect";
import { genderFilterId, genders } from "../../filter/GenderProductFilter";
import useMultiSelectFilter from "../../../hooks/useMultiSelectFilter";

interface ICreatedBoxesFilterContainerProps {
  createdBoxes: CreatedBoxesData;
}

export default function CreatedBoxesFilterContainer({
  createdBoxes,
}: ICreatedBoxesFilterContainerProps) {
  const { interval } = useTimerange();

  const { filterValue } = useValueFilter<IBoxesOrItemsFilter>(
    boxesOrItemsFilterValues,
    defaultBoxesOrItems,
    boxesOrItemsUrlId,
  );

  const { filterValue: filterProductGenders } = useMultiSelectFilter(genders, genderFilterId);

  const createdBoxesFacts = useMemo(() => {
    try {
      return filterListByInterval(
        (createdBoxes.facts as CreatedBoxesResult[]) ?? [],
        "createdOn",
        interval,
      ) as CreatedBoxesResult[];
    } catch (error) {
      // TODO useError
    }
    return [];
  }, [interval, createdBoxes]);

  const filteredFacts = useMemo(() => {
    const filters: TidyFn<object, object>[] = [];
    if (filterProductGenders.length > 0) {
      filters.push(
        filter(
          (fact: CreatedBoxesResult) =>
            filterProductGenders.find((fPG) => fPG.value === fact.gender!) !== undefined,
        ),
      );
    }

    if (filters.length > 0) {
      // @ts-expect-error
      return tidy(createdBoxesFacts, ...filters);
    }
    return createdBoxesFacts;
  }, [createdBoxesFacts, filterProductGenders]);

  const filteredCreatedBoxesCube = {
    facts: filteredFacts,
    dimensions: createdBoxes.dimensions,
  };

  return <CreatedBoxesCharts data={filteredCreatedBoxesCube} boxesOrItems={filterValue.value} />;
}
