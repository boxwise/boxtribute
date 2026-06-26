import { useMemo } from "react";
import { StockOverview, StockOverviewResult } from "../../../../../graphql/types";
import { filterByTags } from "../../../utils/filterByTags";
import type { StockAppliedFilters } from "../../../utils/dashboardFilters";
import type { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";
import StockOverviewBars from "./StockOverviewBars";

interface StockOverviewBarsFilterContainerProps {
  stockOverview: StockOverview;
  appliedFilters: StockAppliedFilters;
  boxesOrItems: BoxesOrItems;
}

export default function StockOverviewBarsFilterContainer({
  stockOverview,
  appliedFilters,
  boxesOrItems,
}: StockOverviewBarsFilterContainerProps) {
  const { products, genders, categories, locations, includedTags, excludedTags } = appliedFilters;

  const filteredStockOverview = useMemo<StockOverview>(() => {
    let facts = (stockOverview?.facts ?? []) as StockOverviewResult[];

    // Only show InStock boxes
    facts = facts.filter((f) => f.boxState === "InStock");

    if (genders.length > 0) {
      facts = facts.filter((f) => genders.includes(f.gender ?? ""));
    }

    if (categories.length > 0) {
      const categoryIds = new Set(categories.map((c) => c.id));
      facts = facts.filter((f) => categoryIds.has(f.categoryId!));
    }

    if (locations.length > 0) {
      const locationIds = new Set(locations.map((l) => l.id));
      facts = facts.filter((f) => locationIds.has(f.locationId!));
    }

    if (products.length > 0) {
      const productNames = new Set(products.map((p) => p.name));
      facts = facts.filter((f) => productNames.has(f.productName ?? ""));
    }

    facts = filterByTags(facts, includedTags, excludedTags);

    return { ...stockOverview, facts } as StockOverview;
  }, [stockOverview, genders, categories, locations, products, includedTags, excludedTags]);

  return (
    <StockOverviewBars
      width="400px"
      height="500px"
      data={filteredStockOverview}
      boxesOrItems={boxesOrItems}
    />
  );
}
