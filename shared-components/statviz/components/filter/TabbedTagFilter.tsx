import { Box, FormLabel } from "@chakra-ui/react";
import { useReactiveVar } from "@apollo/client";
import { ResultOf } from "gql.tada";
import {
  tagFilterIncludedValuesVar,
  tagFilterExcludedValuesVar,
  ITagFilterValue,
} from "../../state/filter";
import useMultiSelectFilter from "../../hooks/useMultiSelectFilter";
import TabbedTagDropdown from "./TabbedTagDropdown";
import { TAG_DIMENSION_INFO_FRAGMENT } from "../../queries/fragments";

export const tagFilterIncludedId = "tags";
export const tagFilterExcludedId = "notags";

/**
 * Converts a tag from GraphQL query to filter value format
 */
export const tagToFilterValue = (
  tag: ResultOf<typeof TAG_DIMENSION_INFO_FRAGMENT>,
): ITagFilterValue => ({
  value: tag.id!.toString(),
  label: tag.name!,
  color: tag.color!,
  id: tag.id!,
  urlId: tag.id!.toString(),
});

export default function TabbedTagFilter() {
  const includedTagFilterValues = useReactiveVar(tagFilterIncludedValuesVar);
  const excludedTagFilterValues = useReactiveVar(tagFilterExcludedValuesVar);

  const {
    includedFilterValue,
    excludedFilterValue,
    onIncludedFilterChange,
    onExcludedFilterChange,
    onClearAll,
  } = useMultiSelectFilter<ITagFilterValue>(
    includedTagFilterValues,
    tagFilterIncludedId,
    [],
    excludedTagFilterValues,
    tagFilterExcludedId,
  );

  return (
    <Box maxW="250px" w="100%">
      <FormLabel htmlFor="tabbed-tag-filter" mb={2}>
        tags
      </FormLabel>
      <TabbedTagDropdown
        availableTags={includedTagFilterValues}
        includedTags={includedFilterValue}
        excludedTags={excludedFilterValue}
        onIncludedChange={onIncludedFilterChange}
        onExcludedChange={onExcludedFilterChange}
        onClearAll={onClearAll}
        placeholder="Select"
      />
    </Box>
  );
}
