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
  FormControl,
  FormLabel,
  Box,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { Filters } from "react-table";
import { boxStateIds } from "utils/constants";

interface ISelectOption {
  label: string;
  value: string;
}

interface BoxesFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  columnFilters: Filters<any>;
  onApplyFilters: (filters: Filters<any>) => void;
  onClearFilters: () => void;
  productOptions: ISelectOption[];
  genderOptions: ISelectOption[];
  sizeOptions: ISelectOption[];
  locationOptions: ISelectOption[];
  tagOptions: ISelectOption[];
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
  }));

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Filters</DrawerHeader>
        <DrawerBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Product</FormLabel>
              <Select
                isMulti
                options={productOptions}
                value={productOptions.filter((o) => stagedFilters.product?.includes(o.value))}
                onChange={(selected) =>
                  handleFilterChange(
                    "product",
                    selected.map((s) => s.value),
                  )
                }
                placeholder="All"
                size="sm"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Gender</FormLabel>
              <Select
                isMulti
                options={genderOptions}
                value={genderOptions.filter((o) => stagedFilters.gender?.includes(o.value))}
                onChange={(selected) =>
                  handleFilterChange(
                    "gender",
                    selected.map((s) => s.value),
                  )
                }
                placeholder="All"
                size="sm"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Size</FormLabel>
              <Select
                isMulti
                options={sizeOptions}
                value={sizeOptions.filter((o) => stagedFilters.size?.includes(o.value))}
                onChange={(selected) =>
                  handleFilterChange(
                    "size",
                    selected.map((s) => s.value),
                  )
                }
                placeholder="All"
                size="sm"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select
                isMulti
                options={stateOptions}
                value={stateOptions.filter((o) => stagedFilters.state?.includes(o.value))}
                onChange={(selected) =>
                  handleFilterChange(
                    "state",
                    selected.map((s) => s.value),
                  )
                }
                placeholder="All"
                size="sm"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Location</FormLabel>
              <Select
                isMulti
                options={locationOptions}
                value={locationOptions.filter((o) => stagedFilters.location?.includes(o.value))}
                onChange={(selected) =>
                  handleFilterChange(
                    "location",
                    selected.map((s) => s.value),
                  )
                }
                placeholder="All"
                size="sm"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Tags</FormLabel>
              <Select
                isMulti
                options={tagOptions}
                value={tagOptions.filter((o) => stagedFilters.tags?.includes(o.value))}
                onChange={(selected) =>
                  handleFilterChange(
                    "tags",
                    selected.map((s) => s.value),
                  )
                }
                placeholder="All"
                size="sm"
              />
            </FormControl>

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
