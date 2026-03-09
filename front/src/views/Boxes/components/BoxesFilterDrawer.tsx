import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import BoxesTagFilter, { IBoxesTagFilterValue } from "./BoxesTagFilter";

export interface FilterOption {
  label: string;
  value: string;
}

interface BoxesFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productOptions: FilterOption[];
  genderOptions: FilterOption[];
  sizeOptions: FilterOption[];
  stateOptions: FilterOption[];
  locationOptions: FilterOption[];
  commentOptions: FilterOption[];
  availableTags: IBoxesTagFilterValue[];
  pendingFilters: {
    product: FilterOption[];
    gender: FilterOption[];
    size: FilterOption[];
    state: FilterOption[];
    location: FilterOption[];
    comment: FilterOption[];
    includedTags: IBoxesTagFilterValue[];
    excludedTags: IBoxesTagFilterValue[];
  };
  onFilterChange: (filterId: string, value: FilterOption[] | IBoxesTagFilterValue[]) => void;
  onApply: () => void;
  onClear: () => void;
}

export function BoxesFilterDrawer({
  isOpen,
  onClose,
  productOptions,
  genderOptions,
  sizeOptions,
  stateOptions,
  locationOptions,
  commentOptions,
  availableTags,
  pendingFilters,
  onFilterChange,
  onApply,
  onClear,
}: BoxesFilterDrawerProps) {
  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  const handleTagsClearAll = () => {
    onFilterChange("includedTags", []);
    onFilterChange("excludedTags", []);
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Filter Boxes</DrawerHeader>

        <DrawerBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Product</FormLabel>
              <Select
                isMulti
                options={productOptions}
                value={pendingFilters.product}
                onChange={(selected) => onFilterChange("product", selected as FilterOption[])}
                placeholder="All products"
                tagVariant="outline"
                tagColorScheme="black"
                isSearchable
              />
            </FormControl>

            <FormControl>
              <FormLabel>Gender</FormLabel>
              <Select
                isMulti
                options={genderOptions}
                value={pendingFilters.gender}
                onChange={(selected) => onFilterChange("gender", selected as FilterOption[])}
                placeholder="All genders"
                tagVariant="outline"
                tagColorScheme="black"
                isSearchable
              />
            </FormControl>

            <FormControl>
              <FormLabel>Size</FormLabel>
              <Select
                isMulti
                options={sizeOptions}
                value={pendingFilters.size}
                onChange={(selected) => onFilterChange("size", selected as FilterOption[])}
                placeholder="All sizes"
                tagVariant="outline"
                tagColorScheme="black"
                isSearchable
              />
            </FormControl>

            <FormControl>
              <FormLabel>Box State</FormLabel>
              <Select
                isMulti
                options={stateOptions}
                value={pendingFilters.state}
                onChange={(selected) => onFilterChange("state", selected as FilterOption[])}
                placeholder="All states"
                tagVariant="outline"
                tagColorScheme="black"
                isSearchable
              />
            </FormControl>

            <FormControl>
              <FormLabel>Location</FormLabel>
              <Select
                isMulti
                options={locationOptions}
                value={pendingFilters.location}
                onChange={(selected) => onFilterChange("location", selected as FilterOption[])}
                placeholder="All locations"
                tagVariant="outline"
                tagColorScheme="black"
                isSearchable
              />
            </FormControl>

            <FormControl>
              <FormLabel>Comments</FormLabel>
              <Select
                isMulti
                options={commentOptions}
                value={pendingFilters.comment}
                onChange={(selected) => onFilterChange("comment", selected as FilterOption[])}
                placeholder="All comments"
                tagVariant="outline"
                tagColorScheme="black"
                isSearchable
              />
            </FormControl>

            <BoxesTagFilter
              availableTags={availableTags}
              includedTags={pendingFilters.includedTags}
              excludedTags={pendingFilters.excludedTags}
              onIncludedChange={(tags) => onFilterChange("includedTags", tags)}
              onExcludedChange={(tags) => onFilterChange("excludedTags", tags)}
              onClearAll={handleTagsClearAll}
            />
          </VStack>
        </DrawerBody>

        <DrawerFooter>
          <Button variant="outline" mr={3} onClick={handleClear}>
            Clear filters
          </Button>
          <Button colorScheme="blue" onClick={handleApply}>
            Apply
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
