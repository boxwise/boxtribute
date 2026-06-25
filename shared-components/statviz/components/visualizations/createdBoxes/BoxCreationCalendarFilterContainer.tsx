import { useMemo } from "react";
import { TidyFn, filter, tidy } from "@tidyjs/tidy";
import { subYears } from "date-fns";
import BoxCreationCalendar from "./BoxCreationCalendar";
import { filterListByInterval } from "../../../../utils/helpers";
import type { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";
import type { StockAppliedFilters } from "../../../utils/dashboardFilters";
import { filterByTags } from "../../../utils/filterByTags";
import { CreatedBoxes as CreatedBoxesType, CreatedBoxesResult } from "../../../../../graphql/types";

interface BoxCreationCalendarFilterContainerProps {
  createdBoxes: CreatedBoxesType;
  appliedFilters: StockAppliedFilters;
  boxesOrItems: BoxesOrItems;
}

export default function BoxCreationCalendarFilterContainer({
  createdBoxes,
  appliedFilters,
  boxesOrItems,
}: BoxCreationCalendarFilterContainerProps) {
  const { products, genders, categories, includedTags, excludedTags } = appliedFilters;

  // Filter to past 12 months
  const past12MonthsFacts = useMemo(() => {
    const interval = { start: subYears(new Date(), 1), end: new Date() };
    try {
      return filterListByInterval(
        (createdBoxes?.facts as CreatedBoxesResult[]) ?? [],
        "createdOn",
        interval,
      );
    } catch {
      return [];
    }
  }, [createdBoxes]);

  const filteredFacts = useMemo(() => {
    const filters: TidyFn<object, object>[] = [];
    if (genders.length > 0) {
      filters.push(filter((fact: CreatedBoxesResult) => genders.includes(fact.gender ?? "")));
    }
    if (products.length > 0) {
      const productIds = new Set(products.map((p) => p.id));
      filters.push(filter((fact: CreatedBoxesResult) => productIds.has(fact.productId!)));
    }
    if (categories.length > 0) {
      const categoryIds = new Set(categories.map((c) => c.id));
      filters.push(filter((fact: CreatedBoxesResult) => categoryIds.has(fact.categoryId!)));
    }

    let filtered = past12MonthsFacts;
    if (filters.length > 0) {
      // @ts-expect-error spread of tidy filter functions not fully typed
      filtered = tidy(past12MonthsFacts, ...filters) as CreatedBoxesResult[];
    }

    filtered = filterByTags(filtered, includedTags, excludedTags);

    return filtered;
  }, [past12MonthsFacts, genders, products, categories, includedTags, excludedTags]);

  const filteredData = {
    facts: filteredFacts,
    dimensions: createdBoxes?.dimensions,
  };

  return (
    <BoxCreationCalendar
      width="100%"
      height="200px"
      boxesOrItems={boxesOrItems}
      data={filteredData}
    />
  );
}
