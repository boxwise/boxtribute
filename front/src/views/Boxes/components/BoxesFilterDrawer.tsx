import { useCallback, useEffect, useState } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  VStack,
  Button,
  HStack,
  Box,
} from "@chakra-ui/react";
import { Filters } from "react-table";
import { boxStateIds } from "utils/constants";
import MultiSelectFilter from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";

interface BoxesFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  columnFilters: Filters<any>;
  onApplyFilters: (filters: Filters<any>) => void;
  onClearFilters: () => void;
  productOptions: IFilterValue[];
  genderOptions: IFilterValue[];
  sizeOptions: IFilterValue[];
  locationOptions: IFilterValue[];
  tagOptions: IFilterValue[];
}

export function BoxesFilterDrawer({
  isOpen,
  onClose,
  columnFilters,
  onApplyFilters,
  onClearFilters,
  productOptions,
  genderOptions,
  sizeOptions,
  locationOptions,
  tagOptions,
}: BoxesFilterDrawerProps) {
  const [stagedFilters, setStagedFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (isOpen) {
      const filtersMap: Record<string, string[]> = {};
      columnFilters.forEach((filter) => {
        if (filter.value && Array.isArray(filter.value)) {
          filtersMap[filter.id] = filter.value;
        }
      });
      setStagedFilters(filtersMap);
    }
  }, [isOpen, columnFilters]);

  const handleFilterChange = useCallback((filterId: string, values: string[]) => {
    setStagedFilters((prev) => ({
      ...prev,
      [filterId]: values,
    }));
  }, []);

  const handleApply = useCallback(() => {
    const filters: Filters<any> = Object.entries(stagedFilters)
      .filter(([, value]) => value.length > 0)
      .map(([id, value]) => ({ id, value }));
    onApplyFilters(filters);
    onClose();
  }, [stagedFilters, onApplyFilters, onClose]);

  const handleClear = useCallback(() => {
    setStagedFilters({});
    onClearFilters();
    onClose();
  }, [onClearFilters, onClose]);

  const stateOptions = Object.entries(boxStateIds).map(([name, id]) => ({
    label: name,
    value: id,
    urlId: id,
  }));

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Filters</DrawerHeader>
        <DrawerBody>
          <VStack spacing={4} align="stretch">
            <MultiSelectFilter
              fieldLabel="Product"
              values={productOptions}
              filterId="product"
              filterValue={productOptions.filter((o) => stagedFilters.product?.includes(o.value))}
              onFilterChange={(selected) =>
                handleFilterChange(
                  "product",
                  selected.map((s) => s.value),
                )
              }
              placeholder="All"
            />

            <MultiSelectFilter
              fieldLabel="Gender"
              values={genderOptions}
              filterId="gender"
              filterValue={genderOptions.filter((o) => stagedFilters.gender?.includes(o.value))}
              onFilterChange={(selected) =>
                handleFilterChange(
                  "gender",
                  selected.map((s) => s.value),
                )
              }
              placeholder="All"
            />

            <MultiSelectFilter
              fieldLabel="Size"
              values={sizeOptions}
              filterId="size"
              filterValue={sizeOptions.filter((o) => stagedFilters.size?.includes(o.value))}
              onFilterChange={(selected) =>
                handleFilterChange(
                  "size",
                  selected.map((s) => s.value),
                )
              }
              placeholder="All"
            />

            <MultiSelectFilter
              fieldLabel="Status"
              values={stateOptions}
              filterId="state"
              filterValue={stateOptions.filter((o) => stagedFilters.state?.includes(o.value))}
              onFilterChange={(selected) =>
                handleFilterChange(
                  "state",
                  selected.map((s) => s.value),
                )
              }
              placeholder="All"
            />

            <MultiSelectFilter
              fieldLabel="Location"
              values={locationOptions}
              filterId="location"
              filterValue={locationOptions.filter((o) => stagedFilters.location?.includes(o.value))}
              onFilterChange={(selected) =>
                handleFilterChange(
                  "location",
                  selected.map((s) => s.value),
                )
              }
              placeholder="All"
            />

            <MultiSelectFilter
              fieldLabel="Tags"
              values={tagOptions}
              filterId="tags"
              filterValue={tagOptions.filter((o) => stagedFilters.tags?.includes(o.value))}
              onFilterChange={(selected) =>
                handleFilterChange(
                  "tags",
                  selected.map((s) => s.value),
                )
              }
              placeholder="All"
            />

            <Box pt={4}>
              <HStack spacing={3}>
                <Button colorScheme="blue" onClick={handleApply} flex={1}>
                  Apply
                </Button>
                <Button variant="outline" onClick={handleClear} flex={1}>
                  Clear filters
                </Button>
              </HStack>
            </Box>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
