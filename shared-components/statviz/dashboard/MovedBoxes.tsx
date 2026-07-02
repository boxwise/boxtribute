import {
  useDisclosure,
  AccordionItem,
  AccordionButton,
  Heading,
  AccordionIcon,
  AccordionPanel,
  Box,
  HStack,
  Select,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import type React from "react";
import { useSearchParams } from "react-router-dom";
import MovedBoxesDataContainer from "../components/visualizations/movedBoxes/MovedBoxesDataContainer";
import { FilterPanel } from "../../filter/FilterPanel";
import { MovementFilters } from "./../components/filter/MovementFilters";
import {
  MOVEMENT_URL_PARAMS,
  type MovementDirection,
  defaultMovementFilters,
  readMovementFiltersFromUrl,
  writeMovementFiltersToUrl,
  type MovementAppliedFilters,
  type IProductOption,
  type ICategoryOption,
  type ITagOption,
} from "../utils/dashboardFilters";
import type { BoxesOrItems } from "../components/filter/BoxesOrItemsSelect";
import DashboardFilterChips from "./DashboardFilterChips";

interface MovedBoxesProps {
  products: IProductOption[];
  categories: ICategoryOption[];
  tags: ITagOption[];
}

export default function MovedBoxes({ products, categories, tags }: MovedBoxesProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const appliedFilters = useMemo(
    () => readMovementFiltersFromUrl(searchParams, products, categories, tags),
    [searchParams, products, categories, tags],
  );

  const boxesOrItems: BoxesOrItems =
    searchParams.get(MOVEMENT_URL_PARAMS.boxesOrItems) === "ic" ? "itemsCount" : "boxesCount";
  const direction: MovementDirection =
    searchParams.get(MOVEMENT_URL_PARAMS.direction) === "in" ? "in" : "out";

  const handleApplyFilters = useCallback(
    (filters: MovementAppliedFilters) => {
      const newParams = new URLSearchParams(searchParams);
      writeMovementFiltersToUrl(filters, newParams);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const handleBoxesOrItemsChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set(
        MOVEMENT_URL_PARAMS.boxesOrItems,
        e.target.value === "itemsCount" ? "ic" : "bc",
      );
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const handleDirectionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set(MOVEMENT_URL_PARAMS.direction, e.target.value === "in" ? "in" : "out");
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const defaultFilters = useMemo(() => defaultMovementFilters(), []);

  const filterChips = useMemo(
    () => [
      ...(appliedFilters.dateFrom !== defaultFilters.dateFrom
        ? [
            {
              key: "date-from",
              label: `From: ${appliedFilters.dateFrom}`,
              onRemove: () =>
                handleApplyFilters({ ...appliedFilters, dateFrom: defaultFilters.dateFrom }),
            },
          ]
        : []),
      ...(appliedFilters.dateTo !== defaultFilters.dateTo
        ? [
            {
              key: "date-to",
              label: `To: ${appliedFilters.dateTo}`,
              onRemove: () =>
                handleApplyFilters({ ...appliedFilters, dateTo: defaultFilters.dateTo }),
            },
          ]
        : []),
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
    [appliedFilters, defaultFilters.dateFrom, defaultFilters.dateTo, handleApplyFilters],
  );

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <AccordionItem>
      <AccordionButton padding="15px 10px">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="md">Movement History</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" spacing={2} align="flex-start">
            <DashboardFilterChips
              chips={filterChips}
              onClearAllFilters={() => handleApplyFilters(defaultFilters)}
              testIdPrefix="movement"
            />
            <HStack spacing={2} marginLeft="auto">
              <Select size="md" value={direction} onChange={handleDirectionChange} width="140px">
                <option value="out">Outgoing</option>
                <option value="in">Incoming</option>
              </Select>
              <Select
                size="md"
                value={boxesOrItems}
                onChange={handleBoxesOrItemsChange}
                width="120px"
              >
                <option value="boxesCount">Boxes</option>
                <option value="itemsCount">Items</option>
              </Select>
              <FilterPanel
                label="Movement Filters"
                isOpen={isOpen}
                onOpen={onOpen}
                onClose={onClose}
              >
                <MovementFilters
                  isOpen={isOpen}
                  onClose={onClose}
                  appliedFilters={appliedFilters}
                  products={products}
                  categories={categories}
                  tags={tags}
                  onApply={handleApplyFilters}
                />
              </FilterPanel>
            </HStack>
          </HStack>
          <MovedBoxesDataContainer
            appliedFilters={appliedFilters}
            boxesOrItems={boxesOrItems}
            direction={direction}
          />
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
}
