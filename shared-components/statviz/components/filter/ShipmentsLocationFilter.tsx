import { Box } from "@chakra-ui/react";
import { useReactiveVar } from "@apollo/client";
import MultiSelectFilter from "./MultiSelectFilter";
import { DimensionInfo } from "../../../types/generated/graphql";
import useMultiSelectFilter from "../../hooks/useMultiSelectFilter";
import { ILocationFilterValue, locationFilterValuesVar } from "../../state/filter";

export const locationFilterId = "location";

export const locationToFilterValue = (tag: DimensionInfo): ILocationFilterValue => ({
  value: tag.id!.toString(),
  label: tag.name!,
  id: tag.id!,
  urlId: tag.id!.toString(),
});

export default function ShipmentsLocationFilter() {
  const locationFilterValues = useReactiveVar(locationFilterValuesVar);
  const { onFilterChange, filterValue } = useMultiSelectFilter<ILocationFilterValue>(
    locationFilterValues,
    locationFilterId,
  );

  return (
    <Box maxW="350">
      <MultiSelectFilter
        onFilterChange={onFilterChange}
        filterValue={filterValue}
        placeholder="locations"
        filterId={locationFilterId}
        fieldLabel="hide locations"
        values={locationFilterValues}
      />
    </Box>
  );
}
