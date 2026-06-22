import { useDisclosure } from "@chakra-ui/react";
import type {
  IProductOption,
  ICategoryOption,
  ITagOption,
  MovementAppliedFilters,
} from "../../utils/dashboardFilters";
import { FilterPanel } from "./FilterPanel";
import { MovementFilters } from "./MovementFilters";

interface MovementFilterPanelProps {
  appliedFilters: MovementAppliedFilters;
  products: IProductOption[];
  categories: ICategoryOption[];
  tags: ITagOption[];
  onApply: (filters: MovementAppliedFilters) => void;
}

export default function MovementFilterPanel({
  appliedFilters,
  products,
  categories,
  tags,
  onApply,
}: MovementFilterPanelProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <FilterPanel
      label="Movement Filters"
      ariaLabel="Open movement filters"
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
        onApply={onApply}
      />
    </FilterPanel>
  );
}
