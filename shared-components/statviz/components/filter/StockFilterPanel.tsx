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
  FormLabel,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import MultiSelectFilter from "./MultiSelectFilter";
import TabbedTagDropdown from "./TabbedTagDropdown";
import type {
  IProductOption,
  ICategoryOption,
  ILocationOption,
  ITagOption,
  StockAppliedFilters,
} from "../../utils/dashboardFilters";
import { genders } from "./GenderProductFilter";
import type { IFilterValue } from "./ValueFilter";

interface StockFilterPanelProps {
  appliedFilters: StockAppliedFilters;
  products: IProductOption[];
  categories: ICategoryOption[];
  locations: ILocationOption[];
  tags: ITagOption[];
  onApply: (filters: StockAppliedFilters) => void;
}

function toFilterValues(
  items: { id: number; name: string }[],
  genderSuffix?: string,
): IFilterValue[] {
  return items.map((item) => ({
    value: String(item.id),
    label: genderSuffix ? `${item.name} (${genderSuffix})` : item.name,
    urlId: String(item.id),
  }));
}

function toProductFilterValues(products: IProductOption[]): IFilterValue[] {
  return products.map((p) => ({
    value: String(p.id),
    label: p.gender ? `${p.name} (${p.gender})` : p.name,
    urlId: String(p.id),
  }));
}

export default function StockFilterPanel({
  appliedFilters,
  products,
  categories,
  locations,
  tags,
  onApply,
}: StockFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [staged, setStaged] = useState<StockAppliedFilters>(appliedFilters);

  // Re-initialise staged state when the drawer opens
  useEffect(() => {
    if (isOpen) {
      setStaged(appliedFilters);
    }
  }, [isOpen, appliedFilters]);

  const productOptions = toProductFilterValues(products);
  const categoryOptions = toFilterValues(categories);
  const locationOptions = toFilterValues(locations);

  const handleApply = useCallback(() => {
    onApply(staged);
    setIsOpen(false);
  }, [staged, onApply]);

  const handleClear = useCallback(() => {
    setStaged({
      products: [],
      genders: [],
      categories: [],
      locations: [],
      includedTags: [],
      excludedTags: [],
    });
  }, []);

  // Helpers to convert between IFilterValue selection and option objects
  const selectedProductValues = productOptions.filter((o) =>
    staged.products.some((p) => String(p.id) === o.value),
  );
  const selectedCategoryValues = categoryOptions.filter((o) =>
    staged.categories.some((c) => String(c.id) === o.value),
  );
  const selectedLocationValues = locationOptions.filter((o) =>
    staged.locations.some((l) => String(l.id) === o.value),
  );
  const selectedGenderValues = genders.filter((g) => staged.genders.includes(g.value));

  return (
    <>
      <IconButton
        aria-label="Open stock filters"
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
          <DrawerHeader>Stock Filters</DrawerHeader>
          <DrawerCloseButton />
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={1} spacing={4}>
                <MultiSelectFilter
                  fieldLabel="Product gender"
                  values={genders}
                  filterId="sg-staged"
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
                  filterId="sp-staged"
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
                  filterId="sc-staged"
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
                <MultiSelectFilter
                  fieldLabel="Location"
                  values={locationOptions}
                  filterId="sl-staged"
                  filterValue={selectedLocationValues}
                  onFilterChange={(selected) => {
                    const selectedIds = selected.map((s) => Number(s.value));
                    setStaged((prev) => ({
                      ...prev,
                      locations: locations.filter((l) => selectedIds.includes(l.id)),
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
                    data-testid="stock-filter-apply"
                  >
                    Apply
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    width="100%"
                    data-testid="stock-filter-clear"
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
