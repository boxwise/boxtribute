import { Box } from "@chakra-ui/react";
import { makeVar, useReactiveVar } from "@apollo/client";
import { ResultOf } from "gql.tada";
import MultiSelectFilter from "./MultiSelectFilter";
import useMultiSelectFilter from "../../hooks/useMultiSelectFilter";
import { ITagFilterValue } from "../../state/filter";
import { TAG_DIMENSION_INFO_FRAGMENT } from "../../queries/fragments";

export const tagFilterIncludedValuesVar = makeVar<ITagFilterValue[]>([]);
export const tagFilterExcludedValuesVar = makeVar<ITagFilterValue[]>([]);

export const tagFilterId = "tags";
export const tagFilterIncludedId = tagFilterId;
export const tagFilterExcludedId = "notags";

export const tagToFilterValue = (
  tag: ResultOf<typeof TAG_DIMENSION_INFO_FRAGMENT>,
): ITagFilterValue => ({
  value: tag.id!.toString(),
  label: tag.name!,
  color: tag.color!,
  id: tag.id!,
  urlId: tag.id!.toString(),
});

export default function TagFilter() {
  const tagFilterValues = useReactiveVar(tagFilterIncludedValuesVar);
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
