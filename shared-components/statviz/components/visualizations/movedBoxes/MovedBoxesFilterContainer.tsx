import { useMemo } from "react";
import { TidyFn, filter, tidy } from "@tidyjs/tidy";
import { filterListByInterval } from "../../../../utils/helpers";
import MovedBoxesCharts from "./MovedBoxesCharts";
import type { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";
import type { MovementAppliedFilters } from "../../../utils/dashboardFilters";
import { filterByTags } from "../../../utils/filterByTags";
import { MovedBoxes, MovedBoxesResult } from "../../../../../graphql/types";

interface IMovedBoxesFilterContainerProps {
  movedBoxes: MovedBoxes;
  appliedFilters: MovementAppliedFilters;
  boxesOrItems: BoxesOrItems;
}

export default function MovedBoxesFilterContainer({
  movedBoxes,
  appliedFilters,
  boxesOrItems,
}: IMovedBoxesFilterContainerProps) {
  const { products, genders, categories, includedTags, excludedTags, dateFrom, dateTo } =
    appliedFilters;

  const interval = useMemo(
    () => ({
      start: new Date(dateFrom),
      end: new Date(dateTo),
    }),
    [dateFrom, dateTo],
  );

  const movedBoxesFacts = useMemo(() => {
    try {
      return filterListByInterval(movedBoxes?.facts as MovedBoxesResult[], "movedOn", interval);
    } catch {
      // TODO show toast with error message?
    }
    return [];
  }, [interval, movedBoxes]);

  const filteredFacts = useMemo(() => {
    const filters: TidyFn<object, object>[] = [];
    if (genders.length > 0) {
      filters.push(
        filter((fact: MovedBoxesResult) => genders.includes(fact.gender?.valueOf() ?? "")),
      );
    }
    if (products.length > 0) {
      filters.push(
        filter((fact: MovedBoxesResult) =>
          products.some(
            (p) => p.name.toLowerCase() === fact.productName! && p.gender === fact.gender,
          ),
        ),
      );
    }
    if (categories.length > 0) {
      const categoryIds = new Set(categories.map((c) => c.id));
      filters.push(filter((fact: MovedBoxesResult) => categoryIds.has(fact.categoryId!)));
    }

    let filtered = movedBoxesFacts;
    if (filters.length > 0) {
      // @ts-expect-error spread of tidy filter functions not fully typed
      filtered = tidy(movedBoxesFacts, ...filters) as MovedBoxesResult[];
    }

    // Apply tag filter (included/excluded)
    filtered = filterByTags(filtered, includedTags, excludedTags);

    return filtered;
  }, [movedBoxesFacts, genders, products, categories, includedTags, excludedTags]);

  const filteredMovedBoxesCube = {
    facts: filteredFacts,
    dimensions: movedBoxes?.dimensions,
  };
  return <MovedBoxesCharts movedBoxes={filteredMovedBoxesCube} boxesOrItems={boxesOrItems} />;
}
