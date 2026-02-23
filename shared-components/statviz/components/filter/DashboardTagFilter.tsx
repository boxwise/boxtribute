import { Box, FormLabel } from "@chakra-ui/react";
import { useReactiveVar } from "@apollo/client";
import { ResultOf } from "gql.tada";
import {
  tagFilterIncludedValuesVar,
  tagFilterExcludedValuesVar,
  ITagFilterValue,
} from "../../state/tagFilterDashboard";
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
 * Main tag filter component for the Dashboard.
 * Provides a dropdown with two tabs for including and excluding tags.
 *
 * Usage in Dashboard:
 * ```tsx
 * import DashboardTagFilter from "../components/filter/DashboardTagFilter";
 *
 * // In your component:
 * <DashboardTagFilter />
 * ```
 *
 * To use the filter in data containers:
 * ```tsx
 * import { useReactiveVar } from "@apollo/client";
 * import { tagFilterIncludedValuesVar, tagFilterExcludedValuesVar } from "../../state/tagFilterDashboard";
 * import useTagFilterDashboard from "../../hooks/useTagFilterDashboard";
 * import { filterByTags } from "../../utils/filterByTags";
 *
 * const includedTags = useReactiveVar(tagFilterIncludedValuesVar);
 * const excludedTags = useReactiveVar(tagFilterExcludedValuesVar);
 * const { includedFilterValue, excludedFilterValue } = useTagFilterDashboard(includedTags, excludedTags);
 *
 * const filteredData = filterByTags(
 *   data,
 *   includedFilterValue,
 *   excludedFilterValue,
 *   (item) => item.tagIds
 * );
 * ```
 */
export default function DashboardTagFilter() {
  const includedValues = useReactiveVar(tagFilterIncludedValuesVar);
  const excludedValues = useReactiveVar(tagFilterExcludedValuesVar);

  const {
    includedFilterValue,
    excludedFilterValue,
    onIncludedFilterChange,
    onExcludedFilterChange,
    onClearAll,
  } = useTagFilterDashboard<ITagFilterValue>(
    includedValues,
    excludedValues,
    tagFilterIncludedId,
    tagFilterExcludedId,
  );

  return (
    <Box maxW="250px" w="100%">
      <FormLabel htmlFor="dashboard-tag-filter" mb={2}>
        tags
      </FormLabel>
      <TabbedTagDropdown
        availableTags={includedValues}
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
