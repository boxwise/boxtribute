import { Box, FormLabel } from "@chakra-ui/react";
import { useReactiveVar } from "@apollo/client";
import {
  tagFilterIncludedValuesVar,
  tagFilterExcludedValuesVar,
  ITagFilterValue,
} from "../../state/filter";
import useMultiSelectFilter from "../../hooks/useMultiSelectFilter";
import TabbedTagDropdown from "./TabbedTagDropdown";
import { tagFilterId } from "./TagFilter";

export const tagFilterIncludedId = tagFilterId;
export const tagFilterExcludedId = "notags";

export default function TabbedTagFilter() {
  const includedTagFilterValues = useReactiveVar(tagFilterIncludedValuesVar);
  const excludedTagFilterValues = useReactiveVar(tagFilterExcludedValuesVar);

  const {
    includedFilterValue: includedTags,
    excludedFilterValue: excludedTags,
    onIncludedFilterChange,
    onExcludedFilterChange,
    onClearAll,
  } = useMultiSelectFilter<ITagFilterValue>(
    includedTagFilterValues,
    tagFilterIncludedId,
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
        includedTags={includedTags}
        excludedTags={excludedTags}
        onIncludedChange={onIncludedFilterChange}
        onExcludedChange={onExcludedFilterChange}
        onClearAll={onClearAll}
        placeholder="Select"
      />
    </Box>
  );
}
