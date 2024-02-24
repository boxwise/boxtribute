import { useReactiveVar } from "@apollo/client";
import { useMemo } from "react";
import { TidyFn, filter, tidy } from "@tidyjs/tidy";
import { StockOverviewData, StockOverviewResult } from "../../../../types/generated/graphql";
import StockCharts from "./StockCharts";
import {
  boxesOrItemsFilterValues,
  boxesOrItemsUrlId,
  defaultBoxesOrItems,
} from "../../filter/BoxesOrItemsSelect";
import useValueFilter from "../../../hooks/useValueFilter";
import useMultiSelectFilter from "../../../hooks/useMultiSelectFilter";
import { tagFilter, tagFilterId } from "../../filter/TagFilter";

interface IStockDataFilterProps {
  stockOverview: StockOverviewData;
}

export default function StockDataFilter({ stockOverview }: IStockDataFilterProps) {
  // currently not affected by the selected timerange

  const tagFilerValues = useReactiveVar(tagFilter);

  const { filterValue } = useValueFilter(
    boxesOrItemsFilterValues,
    defaultBoxesOrItems,
    boxesOrItemsUrlId,
  );

  const { filterValue: filteredTags } = useMultiSelectFilter(tagFilerValues, tagFilterId);

  const filteredStockOverview = useMemo(() => {
    const filters: TidyFn<object, object>[] = [];
    if (filteredTags.length > 0) {
      filters.push(
        filter((fact: StockOverviewResult) =>
          filteredTags.some((fT) => fact.tagIds!.includes(fT.id)),
        ),
      );
    }

    if (filter.length > 0) {
      return {
        ...stockOverview,
        // @ts-expect-error ts(2556)
        facts: tidy(stockOverview.facts, ...filters),
      } as StockOverviewData;
    }
    return stockOverview;
  }, [filteredTags, stockOverview]);

  return <StockCharts stockOverview={filteredStockOverview} boxesOrItems={filterValue.value} />;
}
