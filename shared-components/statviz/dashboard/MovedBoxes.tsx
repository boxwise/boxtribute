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
    [searchParams, products, categories, tags],
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
            <FilterPanel label="Movement Filters" isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
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
          <MovedBoxesDataContainer appliedFilters={appliedFilters} boxesOrItems={boxesOrItems} />
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
}
