import { useCallback, useState } from "react";
import { VStack, Button, Box, SimpleGrid } from "@chakra-ui/react";
import MultiSelectFilter from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import type { IFilterValue } from "@boxtribute/shared-components/statviz/components/filter/MultiSelectFilter";
import type { ShipmentColumnFilter, ShipmentFilterId } from "./types";

const shipmentStateOptions: IFilterValue[] = [
  { label: "Preparing", value: "Preparing", urlId: "Preparing" },
  { label: "Sent", value: "Sent", urlId: "Sent" },
  { label: "Receiving", value: "Receiving", urlId: "Receiving" },
  { label: "Completed", value: "Completed", urlId: "Completed" },
  { label: "Canceled", value: "Canceled", urlId: "Canceled" },
  { label: "Lost", value: "Lost", urlId: "Lost" },
];

interface ShipmentFilterProps {
  onClose: () => void;
  columnFilters: ShipmentColumnFilter[];
  onApplyFilters: (filters: ShipmentColumnFilter[]) => void;
  sourceBaseOptions: IFilterValue[];
  targetBaseOptions: IFilterValue[];
}

export function ShipmentFilter({
  onClose,
  columnFilters,
  onApplyFilters,
  sourceBaseOptions,
  targetBaseOptions,
}: ShipmentFilterProps) {
  const [stagedFilters, setStagedFilters] = useState<Partial<Record<ShipmentFilterId, string[]>>>(
    () => {
      const filtersMap: Partial<Record<ShipmentFilterId, string[]>> = {};
      columnFilters.forEach((filter) => {
        if (filter.value == null) {
          return;
        }
        filtersMap[filter.id] = Array.isArray(filter.value)
          ? filter.value.map(String)
          : [String(filter.value)];
      });
      return filtersMap;
    },
  );

  const handleFilterChange = useCallback((filterId: ShipmentFilterId, values: string[]) => {
    setStagedFilters((prev) => ({
      ...prev,
      [filterId]: values,
    }));
  }, []);

  const handleApply = useCallback(() => {
    const filters: ShipmentColumnFilter[] = (
      Object.entries(stagedFilters) as Array<[ShipmentFilterId, string[]]>
    )
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
          fieldLabel="Sent from"
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
          fieldLabel="Sent to"
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
