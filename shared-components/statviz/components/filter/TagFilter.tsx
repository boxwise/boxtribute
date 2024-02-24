import { Box } from "@chakra-ui/react";
import { makeVar, useReactiveVar } from "@apollo/client";
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
        placeholder="tags"
        filterId={tagFilterId}
        fieldLabel="tags"
        values={tagFilterOptions}
      />
    </Box>
  );
}
