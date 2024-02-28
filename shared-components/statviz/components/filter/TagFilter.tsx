import { Box } from "@chakra-ui/react";
import { useReactiveVar } from "@apollo/client";
import MultiSelectFilter from "./MultiSelectFilter";
import { TagDimensionInfo } from "../../../types/generated/graphql";
import useMultiSelectFilter from "../../hooks/useMultiSelectFilter";
import { ITagFilterValue, tagFilterValuesVar } from "../../state/filter";

export const tagFilterId = "tags";

export const tagToFilterValue = (tag: TagDimensionInfo): ITagFilterValue => ({
  value: tag.id!.toString(),
  label: tag.name!,
  color: tag.color!,
  id: tag.id!,
  urlId: tag.id!.toString(),
});

export default function TagFilter() {
  const tagFilterValues = useReactiveVar(tagFilterValuesVar);
  const { onFilterChange, filterValue } = useMultiSelectFilter<ITagFilterValue>(
    tagFilterValues,
    tagFilterId,
  );

  return (
    <Box maxW="350">
      <MultiSelectFilter
        onFilterChange={onFilterChange}
        filterValue={filterValue}
        placeholder="tags"
        filterId={tagFilterId}
        fieldLabel="tags"
        values={tagFilterValues}
      />
    </Box>
  );
}
