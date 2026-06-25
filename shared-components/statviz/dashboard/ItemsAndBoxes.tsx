import {
  SimpleGrid,
  useDisclosure,
  Box,
  AccordionItem,
  AccordionButton,
  Heading,
  AccordionIcon,
  AccordionPanel,
  HStack,
  Select,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import type React from "react";
import { useSearchParams } from "react-router-dom";
import CreatedBoxesDataContainer from "../components/visualizations/createdBoxes/CreatedBoxesDataContainer";
import StockOverviewRingDataContainer from "../components/visualizations/stock/StockOverviewRingDataContainer";
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
import { FilterPanel } from "../../filter/FilterPanel";
import { StockFilters } from "./../components/filter/StockFilters";

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
    [searchParams, products, categories, locations, tags],
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

  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <AccordionItem>
      <AccordionButton padding="15px 10px">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="md">Stock Overview</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <VStack align="stretch" spacing={4}>
          <HStack justify="flex-end" spacing={2}>
            <Select
              size="md"
              value={boxesOrItems}
              onChange={handleBoxesOrItemsChange}
              width="120px"
            >
              <option value="boxesCount">Boxes</option>
              <option value="itemsCount">Items</option>
            </Select>
            <FilterPanel label="Stock Filters" isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
              <StockFilters
                isOpen={isOpen}
                onClose={onClose}
                appliedFilters={appliedFilters}
                products={products}
                categories={categories}
                locations={locations}
                tags={tags}
                onApply={handleApplyFilters}
              />
            </FilterPanel>
          </HStack>
          <SimpleGrid minChildWidth="400px" spacing={4}>
            <StockOverviewRingDataContainer
              appliedFilters={appliedFilters}
              boxesOrItems={boxesOrItems}
            />
            <CreatedBoxesDataContainer
              appliedFilters={appliedFilters}
              boxesOrItems={boxesOrItems}
            />
          </SimpleGrid>
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
}
