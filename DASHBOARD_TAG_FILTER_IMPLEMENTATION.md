# Dashboard Tag Filter Implementation

## Overview
This implementation extends the tag filter functionality for the Dashboard in `/shared-components/statviz/` to support both including and excluding tags when filtering data.

## Features Implemented

### 1. UI Components
- **TabbedTagFilter**: Main component that provides a tabbed dropdown interface for tag filtering
- **TabbedTagDropdown**: Two-tab interface ("Include" and "Exclude") for tag selection
- **MultiSelectList**: Reusable component for displaying multi-select tag lists with check icons

### 2. State Management
- **filter.tsx**: Centralized state management with reactive variables
  - `tagFilterIncludedValuesVar`: Stores tags to include in filtering (replaces old `tagFilterValuesVar`)
  - `tagFilterExcludedValuesVar`: Stores tags to exclude from filtering

### 3. Custom Hooks
- **useMultiSelectFilter.ts**: Unified hook for managing filter state with optional include/exclude support
  - Handles single-mode filtering (backward compatible with existing uses)
  - Handles included/excluded tags via URL parameters when both `excludedValues` and `excludedFilterId` are provided
  - Provides type-safe return values using TypeScript function overloading
  - Parameters:
    - `tags` URL parameter for included tags
    - `notags` URL parameter for excluded tags
  - Returns different shapes based on mode:
    - Simple mode: `{ filterValue, onFilterChange }`
    - Include/exclude mode: `{ includedFilterValue, excludedFilterValue, onIncludedFilterChange, onExcludedFilterChange, onClearAll }`

### 4. Utilities
- **filterByTags.ts**: Pure function for filtering data based on included and excluded tags
  - Supports OR logic for included tags (item must have at least one)
  - Filters out items with any excluded tags
  - Generic implementation works with any data structure

## Integration Points

### Dashboard Component
Located at: `shared-components/statviz/dashboard/Dashboard.tsx`
- Uses `TabbedTagFilter` component
- Positioned in the filter bar alongside other filters

### Data Containers
Updated to use the unified hook and filtering logic:
1. **CreatedBoxesFilterContainer**: Filters created boxes by tags
2. **DemographicFilterContainer**: Filters demographic data by tags
3. **MovedBoxesFilterContainer**: Filters moved boxes by tags
4. **StockDataFilter**: Filters stock overview by tags

Each container:
- Populates `tagFilterIncludedValuesVar` and `tagFilterExcludedValuesVar` with available tags
- Uses `useMultiSelectFilter` hook in include/exclude mode
- Applies `filterByTags` utility to filter data

## Usage Example

```typescript
import { useReactiveVar } from "@apollo/client";
import {
  tagFilterIncludedValuesVar,
  tagFilterExcludedValuesVar,
} from "@boxtribute/shared-components/statviz/state/filter";
import useMultiSelectFilter from "@boxtribute/shared-components/statviz/hooks/useMultiSelectFilter";
import { filterByTags } from "@boxtribute/shared-components/statviz/utils/filterByTags";

// In your component:
const includedTagFilterValues = useReactiveVar(tagFilterIncludedValuesVar);
const excludedTagFilterValues = useReactiveVar(tagFilterExcludedValuesVar);

// Use hook in include/exclude mode
const { includedFilterValue, excludedFilterValue } = useMultiSelectFilter(
  includedTagFilterValues,
  "tags",
  [],
  excludedTagFilterValues,
  "notags",
);

// Apply filtering:
const filteredData = filterByTags(
  data,
  includedFilterValue,
  excludedFilterValue,
  (item) => item.tagIds
);
```

## URL Parameters
- `tags`: Comma-separated list of tag IDs to include (e.g., `?tags=1,2,3`)
- `notags`: Comma-separated list of tag IDs to exclude (e.g., `?notags=4,5`)

## Visual Behavior
- Dropdown remains open after selecting tags (closes only on clicking outside)
- Selected tags display as colored badges in the trigger button
- Excluded tags show with `not:` prefix in the filter input
- Each tag badge has a close button for quick removal
- Clear all button (X icon) removes all selections atomically

## Testing
- **filterByTags.test.ts**: 9 tests covering all filtering scenarios (100% coverage)
- **TabbedTagFilter.test.tsx**: 4 tests for component rendering and helper functions (100% coverage)
- All tests passing with good coverage metrics

## Refactoring and Consolidation
The implementation consolidates duplicate code and state management:

- Merged `useTagFilterDashboard` into `useMultiSelectFilter` with TypeScript overloading
- Moved state from separate `tagFilterDashboard.ts` into centralized `filter.tsx`
- Replaced `tagFilterValuesVar` with `tagFilterIncludedValuesVar` for clarity
- Eliminated duplicate encoding/decoding functions
- Backward compatible with existing simple multi-select filter usage

## Files Created
1. `shared-components/statviz/components/filter/TabbedTagFilter.tsx` (renamed from DashboardTagFilter)
2. `shared-components/statviz/components/filter/TabbedTagDropdown.tsx`
3. `shared-components/statviz/components/filter/MultiSelectList.tsx`
4. `shared-components/statviz/utils/filterByTags.ts`
5. `shared-components/statviz/utils/filterByTags.test.ts`
6. `shared-components/statviz/components/filter/TabbedTagFilter.test.tsx`

## Files Modified
1. `shared-components/statviz/state/filter.tsx` - Added tag filter reactive variables
2. `shared-components/statviz/hooks/useMultiSelectFilter.ts` - Extended for include/exclude support
3. `shared-components/statviz/dashboard/Dashboard.tsx` - Uses TabbedTagFilter
4. `shared-components/statviz/components/visualizations/createdBoxes/CreatedBoxesFilterContainer.tsx`
5. `shared-components/statviz/components/visualizations/demographic/DemographicFilterContainer.tsx`
6. `shared-components/statviz/components/visualizations/movedBoxes/MovedBoxesFilterContainer.tsx`
7. `shared-components/statviz/components/visualizations/stock/StockDataFilter.tsx`
8. `shared-components/statviz/components/filter/TagFilter.tsx` - Updated to use new state
9. `shared-components/statviz/hooks/useShareableLink.ts` - Updated imports

## Files Deleted
1. `shared-components/statviz/state/tagFilterDashboard.ts` - Consolidated into filter.tsx
2. `shared-components/statviz/hooks/useTagFilterDashboard.ts` - Merged into useMultiSelectFilter

## Technical Notes
- Built with TypeScript, React, Chakra UI, and Apollo Client
- Follows existing patterns in the statviz module
- Backward compatible with existing tag filter usage
- URL state is fully synchronized with component state
- Generic filter utility can be reused for other filtering needs
- Uses TypeScript function overloading for type-safe API
