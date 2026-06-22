import {
  AccordionItem,
  AccordionButton,
  Heading,
  AccordionIcon,
  AccordionPanel,
  Box,
  HStack,
  Select,
} from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import MovedBoxesDataContainer from "../components/visualizations/movedBoxes/MovedBoxesDataContainer";
import MovementFilterPanel from "../components/filter/MovementFilterPanel";
import {
  MOVEMENT_URL_PARAMS,
  readMovementFiltersFromUrl,
  writeMovementFiltersToUrl,
  type MovementAppliedFilters,
  type IProductOption,
  type ICategoryOption,
  type ITagOption,
} from "../utils/dashboardFilters";
import type { BoxesOrItems } from "../components/filter/BoxesOrItemsSelect";

interface MovedBoxesProps {
  products: IProductOption[];
  categories: ICategoryOption[];
  tags: ITagOption[];
}

export default function MovedBoxes({ products, categories, tags }: MovedBoxesProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const appliedFilters = useMemo(
    () => readMovementFiltersFromUrl(searchParams, products, categories, tags),
    // We intentionally only re-derive when URL params change, not when option arrays change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams],
  );

  const boxesOrItems: BoxesOrItems =
    searchParams.get(MOVEMENT_URL_PARAMS.boxesOrItems) === "ic" ? "itemsCount" : "boxesCount";

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

  return (
    <AccordionItem>
      <AccordionButton padding="15px 10px">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="md">Movement History</Heading>
        </Box>
        <HStack spacing={2} onClick={(e) => e.stopPropagation()} mr={2}>
          <Select size="sm" value={boxesOrItems} onChange={handleBoxesOrItemsChange} width="120px">
            <option value="boxesCount">Boxes</option>
            <option value="itemsCount">Items</option>
          </Select>
          <MovementFilterPanel
            appliedFilters={appliedFilters}
            products={products}
            categories={categories}
            tags={tags}
            onApply={handleApplyFilters}
          />
        </HStack>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <MovedBoxesDataContainer appliedFilters={appliedFilters} boxesOrItems={boxesOrItems} />
      </AccordionPanel>
    </AccordionItem>
  );
}
