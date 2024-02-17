import { useMemo } from "react";
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
import {
  genderFilterId,
  genders,
  productFilterId,
  products,
} from "../../filter/GenderProductFilter";

export default function MovedBoxesFilterContainer(props: { movedBoxes: MovedBoxesData }) {
  const { interval } = useTimerange();

  const { filterValue } = useValueFilter(
    boxesOrItemsFilterValues,
    defaultBoxesOrItems,
    boxesOrItemsUrlId,
  );

  const productsFilterValues = useReactiveVar(products);

  const { filterValue: productsFilter } = useMultiSelectFilter(
    productsFilterValues,
    productFilterId,
  );

  const { filterValue: genderFilter } = useMultiSelectFilter(genders, genderFilterId);

  const movedBoxesFacts = useMemo(() => {
    try {
      return filterListByInterval(
        props.movedBoxes.facts as MovedBoxesResult[],
        "movedOn",
        interval,
      ) as MovedBoxesResult[];
    } catch (error) {
      // TODO show toast with error message?
    }
    return [];
  }, [interval, props.movedBoxes.facts]);

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
            productsFilter.find((fBP) => fBP?.value.toLowerCase() === fact.productName!) !==
            undefined,
        ),
      );
    }

    if (filters.length > 0) {
      // @ts-expect-error
      return tidy(movedBoxesFacts, ...filters);
    }
    return movedBoxesFacts;
  }, [genderFilter, movedBoxesFacts, productsFilter]);

  const filteredMovedBoxesCube = {
    facts: filteredFacts as MovedBoxesResult[],
    dimensions: props.movedBoxes.dimensions,
  };
  return <MovedBoxesCharts movedBoxes={filteredMovedBoxesCube} boxesOrItems={filterValue.value} />;
}
