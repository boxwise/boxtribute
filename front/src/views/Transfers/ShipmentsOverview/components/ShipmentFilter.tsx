import { useCallback, useEffect, useState } from "react";
import { VStack, Button, Box, SimpleGrid } from "@chakra-ui/react";
import { Filters } from "react-table";
import MultiSelectFilter from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";

const shipmentStateOptions: IFilterValue[] = [
  { label: "Preparing", value: "Preparing", urlId: "Preparing" },
  { label: "Sent", value: "Sent", urlId: "Sent" },
  { label: "Receiving", value: "Receiving", urlId: "Receiving" },
  { label: "Completed", value: "Completed", urlId: "Completed" },
  { label: "Canceled", value: "Canceled", urlId: "Canceled" },
  { label: "Lost", value: "Lost", urlId: "Lost" },
];

interface ShipmentFilterProps {
  isOpen: boolean;
  onClose: () => void;
  columnFilters: Filters<any>;
  onApplyFilters: (filters: Filters<any>) => void;
  sourceBaseOptions: IFilterValue[];
  targetBaseOptions: IFilterValue[];
}

export function ShipmentFilter({
  isOpen,
  onClose,
  columnFilters,
  onApplyFilters,
  sourceBaseOptions,
  targetBaseOptions,
}: ShipmentFilterProps) {
  const [stagedFilters, setStagedFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (isOpen) {
      const filtersMap: Record<string, string[]> = {};
      columnFilters.forEach((filter) => {
        if (filter.value == null) {
          return;
        }
        if (Array.isArray(filter.value)) {
          filtersMap[filter.id] = filter.value.map(String);
        } else {
          filtersMap[filter.id] = [String(filter.value)];
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
  }, []);

  return (
    <VStack spacing={4} align="stretch">
      <SimpleGrid spacing={4}>
        <MultiSelectFilter
          fieldLabel="Sent from (source base)"
          values={sourceBaseOptions}
          filterId="sourceBaseOrg"
          filterValue={sourceBaseOptions.filter((o) =>
            stagedFilters.sourceBaseOrg?.includes(o.value),
          )}
          onFilterChange={(selected) =>
            handleFilterChange(
              "sourceBaseOrg",
              selected.map((s) => s.value),
            )
          }
          placeholder="All"
        />

        <MultiSelectFilter
          fieldLabel="Sent to (target base)"
          values={targetBaseOptions}
          filterId="targetBaseOrg"
          filterValue={targetBaseOptions.filter((o) =>
            stagedFilters.targetBaseOrg?.includes(o.value),
          )}
          onFilterChange={(selected) =>
            handleFilterChange(
              "targetBaseOrg",
              selected.map((s) => s.value),
            )
          }
          placeholder="All"
        />

        <MultiSelectFilter
          fieldLabel="Status"
          values={shipmentStateOptions}
          filterId="state"
          filterValue={shipmentStateOptions.filter((o) => stagedFilters.state?.includes(o.value))}
          onFilterChange={(selected) =>
            handleFilterChange(
              "state",
              selected.map((s) => s.value),
            )
          }
          placeholder="All"
        />
      </SimpleGrid>

      <Box pt={4}>
        <VStack spacing={3}>
          <Button
            colorScheme="blue"
            onClick={handleApply}
            width="100%"
            data-testid="shipment-filter-apply"
          >
            Apply
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            width="100%"
            data-testid="shipment-filter-clear"
          >
            Clear filters
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
}
