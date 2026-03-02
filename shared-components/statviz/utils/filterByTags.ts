import { ITagFilterValue } from "../state/filter";

/**
 * Utility function to filter data by included and excluded tags.
 *
 * Usage:
 * ```typescript
 * const filteredData = filterByTags(data, includedTags, excludedTags);
 * ```
 *
 * @param data - Array of data items to filter (must have tagIds property)
 * @param includedTags - Tags to include (only items with these tags)
 * @param excludedTags - Tags to exclude (remove items with any of these tags)
 * @returns Filtered array of data items
 */
export function filterByTags<T extends { tagIds?: number[] | null }>(
  data: T[],
  includedTags: ITagFilterValue[],
  excludedTags: ITagFilterValue[],
): T[] {
  return data.filter((item) => {
    const itemTagIds = item.tagIds || [];

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
