import { useDisclosure } from "@chakra-ui/react";
import type {
  IProductOption,
  ICategoryOption,
  ILocationOption,
  ITagOption,
  StockAppliedFilters,
} from "../../utils/dashboardFilters";
import { FilterPanel } from "./FilterPanel";
import { StockFilters } from "./StockFilters";

interface StockFilterPanelProps {
  appliedFilters: StockAppliedFilters;
  products: IProductOption[];
  categories: ICategoryOption[];
  locations: ILocationOption[];
  tags: ITagOption[];
  onApply: (filters: StockAppliedFilters) => void;
}

export default function StockFilterPanel({
  appliedFilters,
  products,
  categories,
  locations,
  tags,
  onApply,
}: StockFilterPanelProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <FilterPanel
      label="Stock Filters"
      ariaLabel="Open stock filters"
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
    >
      <StockFilters
        isOpen={isOpen}
        onClose={onClose}
        appliedFilters={appliedFilters}
        products={products}
        categories={categories}
        locations={locations}
        tags={tags}
        onApply={onApply}
      />
    </FilterPanel>
  );
}
