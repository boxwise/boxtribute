import { useDisclosure } from "@chakra-ui/react";
import type { ITagOption, DemographicsAppliedFilters } from "../../utils/dashboardFilters";
import { FilterPanel } from "./FilterPanel";
import { DemographicsFilters } from "./DemographicsFilters";

interface DemographicsFilterPanelProps {
  appliedFilters: DemographicsAppliedFilters;
  tags: ITagOption[];
  onApply: (filters: DemographicsAppliedFilters) => void;
}

export default function DemographicsFilterPanel({
  appliedFilters,
  tags,
  onApply,
}: DemographicsFilterPanelProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <FilterPanel
      label="Demographics Filters"
      ariaLabel="Open demographics filters"
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
    >
      <DemographicsFilters
        isOpen={isOpen}
        onClose={onClose}
        appliedFilters={appliedFilters}
        tags={tags}
        onApply={onApply}
      />
    </FilterPanel>
  );
}
