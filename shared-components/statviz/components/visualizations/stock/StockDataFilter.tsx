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
import { tagFilterIncludedId, tagFilterExcludedId } from "../../filter/TabbedTagFilter";
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

  const { includedFilterValue: includedTags, excludedFilterValue: excludedTags } =
    useMultiSelectFilter(
      includedTagFilterValues,
      tagFilterIncludedId,
      excludedTagFilterValues,
      tagFilterExcludedId,
    );

  const filteredStockOverview = useMemo(() => {
    // Filter by included and excluded tags
    const tagFilteredFacts = filterByTags(
      (stockOverview?.facts ?? []) as StockOverviewResult[],
      includedTags,
      excludedTags,
    );

    // Filter by box state
    const inStockFacts = tagFilteredFacts.filter((fact) => fact.boxState === "InStock");

    return {
      ...stockOverview,
      facts: inStockFacts,
    } as StockOverview;
  }, [includedTags, excludedTags, stockOverview]);

  return <StockCharts stockOverview={filteredStockOverview} boxesOrItems={filterValue.value} />;
}
