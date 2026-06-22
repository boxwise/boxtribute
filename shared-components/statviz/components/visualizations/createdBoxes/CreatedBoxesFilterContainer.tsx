import { Wrap, WrapItem, Box } from "@chakra-ui/react";
import { useMemo } from "react";
import { TidyFn, filter, tidy } from "@tidyjs/tidy";
import CreatedBoxes from "./CreatedBoxes";
import { filterListByInterval } from "../../../../utils/helpers";
import type { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";
import type { StockAppliedFilters } from "../../../utils/dashboardFilters";
import { filterByTags } from "../../../utils/filterByTags";
import { CreatedBoxes as CreatedBoxesType, CreatedBoxesResult } from "../../../../../graphql/types";

interface ICreatedBoxesFilterContainerProps {
  createdBoxes: CreatedBoxesType;
  appliedFilters: StockAppliedFilters;
  boxesOrItems: BoxesOrItems;
  /** Optional time interval for filtering by creation date */
  interval?: { start: Date; end: Date };
}

export default function CreatedBoxesFilterContainer({
  createdBoxes,
  appliedFilters,
  boxesOrItems,
  interval,
}: ICreatedBoxesFilterContainerProps) {
  const { products, genders, categories, includedTags, excludedTags } = appliedFilters;

  const createdBoxesFacts = useMemo(() => {
    try {
      if (interval) {
        return filterListByInterval(
          (createdBoxes?.facts as CreatedBoxesResult[]) ?? [],
          "createdOn",
          interval,
        );
      }
      return (createdBoxes?.facts as CreatedBoxesResult[]) ?? [];
    } catch {
      // TODO useError
    }
    return [];
  }, [interval, createdBoxes]);

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

    let filtered = createdBoxesFacts;
    if (filters.length > 0) {
      // @ts-expect-error spread of tidy filter functions not fully typed
      filtered = tidy(createdBoxesFacts, ...filters) as CreatedBoxesResult[];
    }

    // Apply tag filter (included/excluded)
    filtered = filterByTags(filtered, includedTags, excludedTags);

    return filtered;
  }, [createdBoxesFacts, genders, products, categories, includedTags, excludedTags]);

  const filteredCreatedBoxesCube = {
    facts: filteredFacts,
    dimensions: createdBoxes?.dimensions,
  };

  return (
    <Wrap gap={6}>
      <WrapItem overflow="auto" padding="5px">
        <Box>
          <CreatedBoxes
            width="900px"
            height="400px"
            boxesOrItems={boxesOrItems}
            data={filteredCreatedBoxesCube}
          />
        </Box>
      </WrapItem>
    </Wrap>
  );
}
