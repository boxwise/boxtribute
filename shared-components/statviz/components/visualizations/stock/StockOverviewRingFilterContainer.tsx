import { useMemo } from "react";
import { useBreakpointValue } from "@chakra-ui/react";
import { StockOverview, StockOverviewResult } from "../../../../../graphql/types";
import { filterByTags } from "../../../utils/filterByTags";
import type { StockAppliedFilters } from "../../../utils/dashboardFilters";
import type { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";
import StockOverviewRing from "./StockOverviewRing";

interface StockOverviewRingFilterContainerProps {
  stockOverview: StockOverview;
  appliedFilters: StockAppliedFilters;
  boxesOrItems: BoxesOrItems;
}

export default function StockOverviewRingFilterContainer({
  stockOverview,
  appliedFilters,
  boxesOrItems,
}: StockOverviewRingFilterContainerProps) {
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
      // Pre-compute keys (same string transformations as in sql.py), then look-up in O(1) per fact
      const productKeys = new Set(
        products.map((p) => `${p.name.trim().toLowerCase()}|${p.gender ?? ""}`),
      );
      facts = facts.filter((f) =>
        productKeys.has(`${(f.productName ?? "").trim()}|${f.gender ?? ""}`),
      );
    }

    facts = filterByTags(facts, includedTags, excludedTags);

    return { ...stockOverview, facts } as StockOverview;
  }, [stockOverview, genders, categories, locations, products, includedTags, excludedTags]);

  const chartHeight = useBreakpointValue({ base: "300px", md: "350px", lg: "400px" }) ?? "400px";

  return (
    <StockOverviewRing
      width="100%"
      height={chartHeight}
      data={filteredStockOverview}
      boxesOrItems={boxesOrItems}
    />
  );
}
