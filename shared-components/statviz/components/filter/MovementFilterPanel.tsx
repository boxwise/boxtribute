import { useCallback, useEffect, useState } from "react";
import {
  VStack,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  SimpleGrid,
  Box,
  IconButton,
  Input,
  FormLabel,
  HStack,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import MultiSelectFilter from "./MultiSelectFilter";
import TabbedTagDropdown from "./TabbedTagDropdown";
import type {
  IProductOption,
  ICategoryOption,
  ITagOption,
  MovementAppliedFilters,
} from "../../utils/dashboardFilters";
import { genders } from "./GenderProductFilter";
import type { IFilterValue } from "./ValueFilter";

interface MovementFilterPanelProps {
  appliedFilters: MovementAppliedFilters;
  products: IProductOption[];
  categories: ICategoryOption[];
  tags: ITagOption[];
  onApply: (filters: MovementAppliedFilters) => void;
}

function toProductFilterValues(products: IProductOption[]): IFilterValue[] {
  return products.map((p) => ({
    value: String(p.id),
    label: p.gender ? `${p.name} (${p.gender})` : p.name,
    urlId: String(p.id),
  }));
}

function toFilterValues(items: { id: number; name: string }[]): IFilterValue[] {
  return items.map((item) => ({
    value: String(item.id),
    label: item.name,
    urlId: String(item.id),
  }));
}

export default function MovementFilterPanel({
  appliedFilters,
  products,
  categories,
  tags,
  onApply,
}: MovementFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [staged, setStaged] = useState<MovementAppliedFilters>(appliedFilters);

  // Re-initialise staged state when the drawer opens
  useEffect(() => {
    if (isOpen) {
      setStaged(appliedFilters);
    }
  }, [isOpen, appliedFilters]);

  const productOptions = toProductFilterValues(products);
  const categoryOptions = toFilterValues(categories);

  const handleApply = useCallback(() => {
    onApply(staged);
    setIsOpen(false);
  }, [staged, onApply]);

  const handleClear = useCallback(() => {
    setStaged((prev) => ({
      ...prev,
      products: [],
      genders: [],
      categories: [],
      includedTags: [],
      excludedTags: [],
    }));
  }, []);

  const selectedProductValues = productOptions.filter((o) =>
    staged.products.some((p) => String(p.id) === o.value),
  );
  const selectedCategoryValues = categoryOptions.filter((o) =>
    staged.categories.some((c) => String(c.id) === o.value),
  );
  const selectedGenderValues = genders.filter((g) => staged.genders.includes(g.value));

  return (
    <>
      <IconButton
        aria-label="Open movement filters"
        icon={<SettingsIcon />}
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      />
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} placement="right" size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Movement Filters</DrawerHeader>
          <DrawerCloseButton />
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={1} spacing={4}>
                <Box>
                  <FormLabel mb={2}>Move date</FormLabel>
                  <HStack>
                    <Box>
                      <FormLabel fontSize="sm">From</FormLabel>
                      <Input
                        type="date"
                        size="sm"
                        value={staged.dateFrom}
                        max={new Date().toISOString().substring(0, 10)}
                        onChange={(e) =>
                          setStaged((prev) => ({ ...prev, dateFrom: e.target.value }))
                        }
                      />
                    </Box>
                    <Box>
                      <FormLabel fontSize="sm">To</FormLabel>
                      <Input
                        type="date"
                        size="sm"
                        value={staged.dateTo}
                        max={new Date().toISOString().substring(0, 10)}
                        onChange={(e) => setStaged((prev) => ({ ...prev, dateTo: e.target.value }))}
                      />
                    </Box>
                  </HStack>
                </Box>
                <MultiSelectFilter
                  fieldLabel="Product gender"
                  values={genders}
                  filterId="mg-staged"
                  filterValue={selectedGenderValues}
                  onFilterChange={(selected) =>
                    setStaged((prev) => ({
                      ...prev,
                      genders: selected.map((s) => s.value),
                    }))
                  }
                  placeholder="All"
                />
                <MultiSelectFilter
                  fieldLabel="Product"
                  values={productOptions}
                  filterId="mp-staged"
                  filterValue={selectedProductValues}
                  onFilterChange={(selected) => {
                    const selectedIds = selected.map((s) => Number(s.value));
                    setStaged((prev) => ({
                      ...prev,
                      products: products.filter((p) => selectedIds.includes(p.id)),
                    }));
                  }}
                  placeholder="All"
                />
                <MultiSelectFilter
                  fieldLabel="Product category"
                  values={categoryOptions}
                  filterId="mc-staged"
                  filterValue={selectedCategoryValues}
                  onFilterChange={(selected) => {
                    const selectedIds = selected.map((s) => Number(s.value));
                    setStaged((prev) => ({
                      ...prev,
                      categories: categories.filter((c) => selectedIds.includes(c.id)),
                    }));
                  }}
                  placeholder="All"
                />
                <Box>
                  <FormLabel mb={2}>Tags</FormLabel>
                  <TabbedTagDropdown
                    availableTags={tags}
                    includedTags={staged.includedTags}
                    excludedTags={staged.excludedTags}
                    onIncludedChange={(newTags) =>
                      setStaged((prev) => ({ ...prev, includedTags: newTags }))
                    }
                    onExcludedChange={(newTags) =>
                      setStaged((prev) => ({ ...prev, excludedTags: newTags }))
                    }
                    onClearAll={() =>
                      setStaged((prev) => ({ ...prev, includedTags: [], excludedTags: [] }))
                    }
                    placeholder="Select tags"
                  />
                </Box>
              </SimpleGrid>
              <Box pt={4}>
                <VStack spacing={3}>
                  <Button
                    colorScheme="blue"
                    onClick={handleApply}
                    width="100%"
                    data-testid="movement-filter-apply"
                  >
                    Apply
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    width="100%"
                    data-testid="movement-filter-clear"
                  >
                    Clear filters
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
