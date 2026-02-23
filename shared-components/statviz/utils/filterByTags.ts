import { ITagFilterValue } from "../state/tagFilterDashboard";

/**
 * Utility function to filter data by included and excluded tags.
 *
 * Usage:
 * ```typescript
 * const filteredData = filterByTags(data, includedTags, excludedTags, (item) => item.tagIds);
 * ```
 *
 * @param data - Array of data items to filter
 * @param includedTags - Tags to include (only items with these tags)
 * @param excludedTags - Tags to exclude (remove items with any of these tags)
 * @param getTagIds - Function to extract tag IDs from a data item
 * @returns Filtered array of data items
 */
export function filterByTags<T>(
  data: T[],
  includedTags: ITagFilterValue[],
  excludedTags: ITagFilterValue[],
  getTagIds: (item: T) => number[] | null | undefined,
): T[] {
  return data.filter((item) => {
    const itemTagIds = getTagIds(item) || [];

    // If included tags are specified, item must have at least one of them
    if (includedTags.length > 0) {
      const hasIncludedTag = includedTags.some((tag) => itemTagIds.includes(tag.id));
      if (!hasIncludedTag) {
        return false;
      }
    }

    // If excluded tags are specified, item must not have any of them
    if (excludedTags.length > 0) {
      const hasExcludedTag = excludedTags.some((tag) => itemTagIds.includes(tag.id));
      if (hasExcludedTag) {
        return false;
      }
    }

    return true;
  });
}
