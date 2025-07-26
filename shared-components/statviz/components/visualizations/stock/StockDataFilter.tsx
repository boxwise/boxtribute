import { useReactiveVar } from "@apollo/client";
import { useMemo } from "react";
import { TidyFn, filter, tidy } from "@tidyjs/tidy";
import StockCharts from "./StockCharts";
import {
  boxesOrItemsFilterValues,
  boxesOrItemsUrlId,
  defaultBoxesOrItems,
} from "../../filter/BoxesOrItemsSelect";
import useValueFilter from "../../../hooks/useValueFilter";
import useMultiSelectFilter from "../../../hooks/useMultiSelectFilter";
import { tagFilterId } from "../../filter/TagFilter";
import { categoryFilterId } from "../../filter/GenderProductFilter";
import { tagFilterValuesVar, categoryFilterValuesVar } from "../../../state/filter";
import { StockOverview, StockOverviewResult } from "../../../../../graphql/types";

interface IStockDataFilterProps {
  stockOverview: StockOverview;
}

export default function StockDataFilter({ stockOverview }: IStockDataFilterProps) {
  // currently not affected by the selected timerange

  const tagFilerValues = useReactiveVar(tagFilterValuesVar);
  const categoryFilterValues = useReactiveVar(categoryFilterValuesVar);

  const { filterValue } = useValueFilter(
    boxesOrItemsFilterValues,
    defaultBoxesOrItems,
    boxesOrItemsUrlId,
  );

  const { filterValue: filteredTags } = useMultiSelectFilter(tagFilerValues, tagFilterId);
  const { filterValue: filterCategories } = useMultiSelectFilter(
    categoryFilterValues,
    categoryFilterId,
  );

  const filteredStockOverview = useMemo(() => {
    const filters: TidyFn<object, object>[] = [];
    if (filteredTags.length > 0) {
      filters.push(
        filter((fact: StockOverviewResult) =>
          filteredTags.some((fT) => fact.tagIds!.includes(fT.id)),
        ),
      );
    }
    if (filterCategories.length > 0) {
      filters.push(
        filter(
          (fact: StockOverviewResult) =>
            filterCategories.find((fC) => fC?.id === fact.categoryId!) !== undefined,
        ),
      );
    }

    filters.push(filter((fact: StockOverviewResult) => fact.boxState === "InStock"));

    if (filters.length > 0) {
      return {
        ...stockOverview,
        // @ts-expect-error ts(2556)
        facts: tidy(stockOverview.facts, ...filters),
      } as StockOverview;
    }
    return stockOverview;
  }, [filteredTags, filterCategories, stockOverview]);

  return <StockCharts stockOverview={filteredStockOverview} boxesOrItems={filterValue.value} />;
}
