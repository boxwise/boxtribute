import { Box, FormLabel } from "@chakra-ui/react";
import TabbedTagDropdown from "../../../../../shared-components/statviz/components/filter/TabbedTagDropdown";

export interface IBoxesTagFilterValue {
  value: string;
  label: string;
  urlId: string;
  color: string;
  id: number;
}

interface BoxesTagFilterProps {
  availableTags: IBoxesTagFilterValue[];
  includedTags: IBoxesTagFilterValue[];
  excludedTags: IBoxesTagFilterValue[];
  onIncludedChange: (tags: IBoxesTagFilterValue[]) => void;
  onExcludedChange: (tags: IBoxesTagFilterValue[]) => void;
  onClearAll?: () => void;
}

export default function BoxesTagFilter({
  availableTags,
  includedTags,
  excludedTags,
  onIncludedChange,
  onExcludedChange,
  onClearAll,
}: BoxesTagFilterProps) {
  return (
    <Box w="100%">
      <FormLabel mb={2}>Tags</FormLabel>
      <TabbedTagDropdown
        availableTags={availableTags}
        includedTags={includedTags}
        excludedTags={excludedTags}
        onIncludedChange={onIncludedChange}
        onExcludedChange={onExcludedChange}
        onClearAll={onClearAll}
        placeholder="Select tags"
      />
    </Box>
  );
}
