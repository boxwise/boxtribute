import {
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
  SimpleGrid,
} from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import type React from "react";
import { useSearchParams } from "react-router-dom";
import BoxCreationCalendarDataContainer from "../components/visualizations/createdBoxes/BoxCreationCalendarDataContainer";
import StockOverviewRingDataContainer from "../components/visualizations/stock/StockOverviewRingDataContainer";
import StockOverviewBarsDataContainer from "../components/visualizations/stock/StockOverviewBarsDataContainer";
import {
  STOCK_URL_PARAMS,
  DEFAULT_STOCK_FILTERS,
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
import DashboardFilterChips from "./DashboardFilterChips";

interface StockOverviewProps {
  products: IProductOption[];
  categories: ICategoryOption[];
  locations: ILocationOption[];
  tags: ITagOption[];
}

export default function StockOverview({
  products,
  categories,
  locations,
  tags,
}: StockOverviewProps) {
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

  const filterChips = useMemo(
    () => [
      ...appliedFilters.genders.map((gender) => ({
        key: `gender-${gender}`,
        label: gender,
        onRemove: () =>
          handleApplyFilters({
            ...appliedFilters,
            genders: appliedFilters.genders.filter((g) => g !== gender),
          }),
      })),
      ...appliedFilters.products.map((product) => ({
        key: `product-${product.id}`,
        label: product.gender ? `${product.name} (${product.gender})` : product.name,
        onRemove: () =>
          handleApplyFilters({
            ...appliedFilters,
            products: appliedFilters.products.filter((p) => p.id !== product.id),
          }),
      })),
      ...appliedFilters.categories.map((category) => ({
        key: `category-${category.id}`,
        label: category.name,
        onRemove: () =>
          handleApplyFilters({
            ...appliedFilters,
            categories: appliedFilters.categories.filter((c) => c.id !== category.id),
          }),
      })),
      ...appliedFilters.locations.map((location) => ({
        key: `location-${location.id}`,
        label: location.name,
        onRemove: () =>
          handleApplyFilters({
            ...appliedFilters,
            locations: appliedFilters.locations.filter((l) => l.id !== location.id),
          }),
      })),
      ...appliedFilters.includedTags.map((tag) => ({
        key: `included-tag-${tag.id}`,
        label: tag.label,
        onRemove: () =>
          handleApplyFilters({
            ...appliedFilters,
            includedTags: appliedFilters.includedTags.filter((t) => t.id !== tag.id),
          }),
      })),
      ...appliedFilters.excludedTags.map((tag) => ({
        key: `excluded-tag-${tag.id}`,
        label: tag.label,
        isExcluded: true,
        onRemove: () =>
          handleApplyFilters({
            ...appliedFilters,
            excludedTags: appliedFilters.excludedTags.filter((t) => t.id !== tag.id),
          }),
      })),
    ],
    [appliedFilters, handleApplyFilters],
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
          <HStack justify="space-between" spacing={2} align="flex-start">
            <DashboardFilterChips
              chips={filterChips}
              onClearAllFilters={() => handleApplyFilters(DEFAULT_STOCK_FILTERS)}
              testIdPrefix="stock"
            />
            <HStack spacing={2} marginLeft="auto">
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
          </HStack>
          <SimpleGrid minChildWidth="500px" spacing={4}>
            <StockOverviewRingDataContainer
              appliedFilters={appliedFilters}
              boxesOrItems={boxesOrItems}
            />
            <StockOverviewBarsDataContainer
              appliedFilters={appliedFilters}
              boxesOrItems={boxesOrItems}
            />
          </SimpleGrid>
          <BoxCreationCalendarDataContainer
            appliedFilters={appliedFilters}
            boxesOrItems={boxesOrItems}
          />
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
}
