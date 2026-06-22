import {
  Box,
  AccordionItem,
  AccordionButton,
  Heading,
  AccordionIcon,
  AccordionPanel,
  HStack,
  Select,
} from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import CreatedBoxesDataContainer from "../components/visualizations/createdBoxes/CreatedBoxesDataContainer";
import StockFilterPanel from "../components/filter/StockFilterPanel";
import {
  STOCK_URL_PARAMS,
  readStockFiltersFromUrl,
  writeStockFiltersToUrl,
  type StockAppliedFilters,
  type IProductOption,
  type ICategoryOption,
  type ILocationOption,
  type ITagOption,
} from "../utils/dashboardFilters";
import type { BoxesOrItems } from "../components/filter/BoxesOrItemsSelect";

export type BoxesOrItemsCount = "boxesCount" | "itemsCount";

interface ItemsAndBoxesProps {
  products: IProductOption[];
  categories: ICategoryOption[];
  locations: ILocationOption[];
  tags: ITagOption[];
}

export default function ItemsAndBoxes({
  products,
  categories,
  locations,
  tags,
}: ItemsAndBoxesProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const appliedFilters = useMemo(
    () => readStockFiltersFromUrl(searchParams, products, categories, locations, tags),
    // We intentionally only re-derive when URL params change, not when option arrays change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams],
  );

  const boxesOrItems: BoxesOrItems =
    searchParams.get(STOCK_URL_PARAMS.boxesOrItems) === "ic" ? "itemsCount" : "boxesCount";

  const handleApplyFilters = useCallback(
    (filters: StockAppliedFilters) => {
      const newParams = new URLSearchParams(searchParams);
      writeStockFiltersToUrl(filters, newParams);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const handleBoxesOrItemsChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set(STOCK_URL_PARAMS.boxesOrItems, e.target.value === "itemsCount" ? "ic" : "bc");
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  return (
    <AccordionItem>
      <AccordionButton padding="15px 10px">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="md">Stock Overview</Heading>
        </Box>
        <HStack spacing={2} onClick={(e) => e.stopPropagation()} mr={2}>
          <Select size="sm" value={boxesOrItems} onChange={handleBoxesOrItemsChange} width="120px">
            <option value="boxesCount">Boxes</option>
            <option value="itemsCount">Items</option>
          </Select>
          <StockFilterPanel
            appliedFilters={appliedFilters}
            products={products}
            categories={categories}
            locations={locations}
            tags={tags}
            onApply={handleApplyFilters}
          />
        </HStack>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <CreatedBoxesDataContainer appliedFilters={appliedFilters} boxesOrItems={boxesOrItems} />
      </AccordionPanel>
    </AccordionItem>
  );
}
