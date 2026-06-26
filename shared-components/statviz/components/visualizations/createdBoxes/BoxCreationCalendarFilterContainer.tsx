import { useMemo } from "react";
import { TidyFn, filter, tidy } from "@tidyjs/tidy";
import { useSearchParams } from "react-router-dom";
import BoxCreationCalendar from "./BoxCreationCalendar";
import { filterListByInterval } from "../../../../utils/helpers";
import type { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";
import type { StockAppliedFilters } from "../../../utils/dashboardFilters";
import { readCalendarFiltersFromUrl } from "../../../utils/dashboardFilters";
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

  const [searchParams] = useSearchParams();
  const { dateFrom, dateTo } = readCalendarFiltersFromUrl(searchParams);

  const intervalFacts = useMemo(() => {
    const interval = { start: new Date(dateFrom), end: new Date(dateTo) };
    try {
      return filterListByInterval(
        (createdBoxes?.facts as CreatedBoxesResult[]) ?? [],
        "createdOn",
        interval,
      );
    } catch {
      return [];
    }
  }, [createdBoxes, dateFrom, dateTo]);

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

    let filtered = intervalFacts;
    if (filters.length > 0) {
      // @ts-expect-error spread of tidy filter functions not fully typed
      filtered = tidy(intervalFacts, ...filters) as CreatedBoxesResult[];
    }

    filtered = filterByTags(filtered, includedTags, excludedTags);

    return filtered;
  }, [intervalFacts, genders, products, categories, includedTags, excludedTags]);

  const filteredData = {
    facts: filteredFacts,
    dimensions: createdBoxes?.dimensions,
  };

  return (
    <BoxCreationCalendar
      width="700px"
      height="200px"
      boxesOrItems={boxesOrItems}
      data={filteredData}
    />
  );
}
