import { Box, FormLabel } from "@chakra-ui/react";
import { useReactiveVar } from "@apollo/client";
import { ResultOf } from "gql.tada";
import {
  tagFilterIncludedValuesVar,
  tagFilterExcludedValuesVar,
  ITagFilterValue,
} from "../../state/filter";
import useTagFilterDashboard from "../../hooks/useTagFilterDashboard";
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

/**
 * Main tag filter component with tabbed interface for including and excluding tags.
 * Provides a dropdown with two tabs for including and excluding tags.
 *
 * Usage in Dashboard:
 * ```tsx
 * import TabbedTagFilter from "../components/filter/TabbedTagFilter";
 *
 * // In your component:
 * <TabbedTagFilter />
 * ```
 *
 * To use the filter in data containers:
 * ```tsx
 * import { useReactiveVar } from "@apollo/client";
 * import { tagFilterIncludedValuesVar, tagFilterExcludedValuesVar } from "../../state/filter";
 * import useTagFilterDashboard from "../../hooks/useTagFilterDashboard";
 * import { filterByTags } from "../../utils/filterByTags";
 *
 * const includedTagFilterValues = useReactiveVar(tagFilterIncludedValuesVar);
 * const excludedTagFilterValues = useReactiveVar(tagFilterExcludedValuesVar);
 * const { includedFilterValue, excludedFilterValue } = useTagFilterDashboard(includedTagFilterValues, excludedTagFilterValues);
 *
 * const filteredData = filterByTags(
 *   data,
 *   includedFilterValue,
 *   excludedFilterValue,
 *   (item) => item.tagIds
 * );
 * ```
 */
export default function TabbedTagFilter() {
  const includedTagFilterValues = useReactiveVar(tagFilterIncludedValuesVar);
  const excludedTagFilterValues = useReactiveVar(tagFilterExcludedValuesVar);

  const {
    includedFilterValue,
    excludedFilterValue,
    onIncludedFilterChange,
    onExcludedFilterChange,
    onClearAll,
  } = useTagFilterDashboard<ITagFilterValue>(
    includedTagFilterValues,
    excludedTagFilterValues,
    tagFilterIncludedId,
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
