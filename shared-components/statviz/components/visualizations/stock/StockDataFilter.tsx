import { useReactiveVar } from "@apollo/client";
import { useMemo } from "react";
import StockCharts from "./StockCharts";
import {
  boxesOrItemsFilterValues,
  boxesOrItemsUrlId,
  defaultBoxesOrItems,
} from "../../filter/BoxesOrItemsSelect";
import useValueFilter from "../../../hooks/useValueFilter";
import { tagFilterIncludedValuesVar, tagFilterExcludedValuesVar } from "../../../state/filter";
import useMultiSelectFilter from "../../../hooks/useMultiSelectFilter";
import { filterByTags } from "../../../utils/filterByTags";
import { StockOverview, StockOverviewResult } from "../../../../../graphql/types";

interface IStockDataFilterProps {
  stockOverview: StockOverview;
}

export default function StockDataFilter({ stockOverview }: IStockDataFilterProps) {
  // currently not affected by the selected timerange

  const includedTagFilterValues = useReactiveVar(tagFilterIncludedValuesVar);
  const excludedTagFilterValues = useReactiveVar(tagFilterExcludedValuesVar);

  const { filterValue } = useValueFilter(
    boxesOrItemsFilterValues,
    defaultBoxesOrItems,
    boxesOrItemsUrlId,
  );

  const { includedFilterValue, excludedFilterValue } = useMultiSelectFilter(
    includedTagFilterValues,
    "tags",
    [],
    excludedTagFilterValues,
    "notags",
  );

  const filteredStockOverview = useMemo(() => {
    // Filter by included and excluded tags
    const tagFilteredFacts = filterByTags(
      (stockOverview?.facts ?? []) as StockOverviewResult[],
      includedFilterValue,
      excludedFilterValue,
      (fact) => fact.tagIds,
    );

    // Filter by box state
    const inStockFacts = tagFilteredFacts.filter((fact) => fact.boxState === "InStock");

    return {
      ...stockOverview,
      facts: inStockFacts,
    } as StockOverview;
  }, [includedFilterValue, excludedFilterValue, stockOverview]);

  return <StockCharts stockOverview={filteredStockOverview} boxesOrItems={filterValue.value} />;
}
