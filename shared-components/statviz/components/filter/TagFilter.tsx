import { makeVar, useReactiveVar } from "@apollo/client";
import { Box } from "@chakra-ui/react";
import MultiSelectFilter from "./MultiSelectFilter";
import { IFilterValue } from "./ValueFilter";
import { TagDimensionInfo } from "../../../types/generated/graphql";
import useMultiSelectFilter from "../../hooks/useMultiSelectFilter";

interface ITagFilterValue extends IFilterValue {
  color: string;
  id: number;
}

export const tagFilterId = "tags";

export const tagFilter = makeVar<ITagFilterValue[]>([]);

export const tagToFilterValue = (tag: TagDimensionInfo): ITagFilterValue => ({
  value: tag.id!.toString(),
  label: tag.name!,
  color: tag.color!,
  id: tag.id!,
  urlId: tag.id!.toString(),
});

export default function TagFilter() {
  const tagFilterOptions = useReactiveVar(tagFilter);
  const { onFilterChange, filterValue } = useMultiSelectFilter<ITagFilterValue>(
    tagFilterOptions,
    tagFilterId,
  );

  return (
    <Box maxW="350">
      <MultiSelectFilter
        onFilterChange={onFilterChange}
        filterValue={filterValue}
        placeholder="Filter Tags"
        filterId={tagFilterId}
        fieldLabel="filter tags"
        values={tagFilterOptions}
      />
    </Box>
  );
}
