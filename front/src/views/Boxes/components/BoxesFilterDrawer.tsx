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
} from "@chakra-ui/react";
import BoxesTagFilter, { IBoxesTagFilterValue } from "./BoxesTagFilter";
import MultiSelectFilter, {
  IFilterValue,
} from "../../../../../shared-components/statviz/components/filter/MultiSelectFilter";

export interface FilterOption extends IFilterValue {
  label: string;
  value: string;
  urlId: string;
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
            <MultiSelectFilter
              values={productOptions}
              filterId="product"
              filterValue={pendingFilters.product}
              fieldLabel="Product"
              placeholder={productOptions.length === 0 ? "Loading options..." : "All products"}
              onFilterChange={(selected) => onFilterChange("product", selected)}
            />

            <MultiSelectFilter
              values={genderOptions}
              filterId="gender"
              filterValue={pendingFilters.gender}
              fieldLabel="Gender"
              placeholder={genderOptions.length === 0 ? "Loading options..." : "All genders"}
              onFilterChange={(selected) => onFilterChange("gender", selected)}
            />

            <MultiSelectFilter
              values={sizeOptions}
              filterId="size"
              filterValue={pendingFilters.size}
              fieldLabel="Size"
              placeholder={sizeOptions.length === 0 ? "Loading options..." : "All sizes"}
              onFilterChange={(selected) => onFilterChange("size", selected)}
            />

            <MultiSelectFilter
              values={stateOptions}
              filterId="state"
              filterValue={pendingFilters.state}
              fieldLabel="Box State"
              placeholder="All states"
              onFilterChange={(selected) => onFilterChange("state", selected)}
            />

            <MultiSelectFilter
              values={locationOptions}
              filterId="location"
              filterValue={pendingFilters.location}
              fieldLabel="Location"
              placeholder="All locations"
              onFilterChange={(selected) => onFilterChange("location", selected)}
            />

            <MultiSelectFilter
              values={commentOptions}
              filterId="comment"
              filterValue={pendingFilters.comment}
              fieldLabel="Comments"
              placeholder="All comments"
              onFilterChange={(selected) => onFilterChange("comment", selected)}
            />

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
