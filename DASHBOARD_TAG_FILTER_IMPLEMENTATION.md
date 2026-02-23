# Dashboard Tag Filter Implementation

## Overview
This implementation extends the tag filter functionality for the Dashboard in `/shared-components/statviz/` to support both including and excluding tags when filtering data.

## Features Implemented

### 1. UI Components
- **DashboardTagFilter**: Main component that provides a dropdown interface for tag filtering
- **TabbedTagDropdown**: Two-tab interface ("Including" and "Excluding") for tag selection
- **MultiSelectList**: Reusable component for displaying multi-select tag lists with checkboxes

### 2. State Management
- **tagFilterDashboard.ts**: Contains reactive variables for managing included and excluded tag state
  - `tagFilterIncludedValuesVar`: Stores tags to include in filtering
  - `tagFilterExcludedValuesVar`: Stores tags to exclude from filtering

### 3. Custom Hooks
- **useTagFilterDashboard.ts**: Manages tag filter state and URL synchronization
  - Handles included tags via `tags` URL parameter
  - Handles excluded tags via `notags` URL parameter
  - Provides onChange handlers for both filter types

### 4. Utilities
- **filterByTags.ts**: Pure function for filtering data based on included and excluded tags
  - Supports OR logic for included tags (item must have at least one)
  - Filters out items with any excluded tags
  - Generic implementation works with any data structure

## Integration Points

### Dashboard Component
Located at: `shared-components/statviz/dashboard/Dashboard.tsx`
- Replaced old `TagFilter` with new `DashboardTagFilter`
- Positioned in the filter bar alongside other filters

### Data Containers
Updated to use the new filtering logic:
1. **CreatedBoxesFilterContainer**: Filters created boxes by tags
2. **DemographicFilterContainer**: Filters demographic data by tags
3. **MovedBoxesFilterContainer**: Filters moved boxes by tags
4. **StockDataFilter**: Filters stock overview by tags

Each container:
- Populates `tagFilterIncludedValuesVar` and `tagFilterExcludedValuesVar` with available tags
- Uses `useTagFilterDashboard` hook to get current filter state
- Applies `filterByTags` utility to filter data

## Usage Example

```typescript
import { useReactiveVar } from "@apollo/client";
import {
  tagFilterIncludedValuesVar,
  tagFilterExcludedValuesVar,
} from "@boxtribute/shared-components/statviz/state/tagFilterDashboard";
import useTagFilterDashboard from "@boxtribute/shared-components/statviz/hooks/useTagFilterDashboard";
import { filterByTags } from "@boxtribute/shared-components/statviz/utils/filterByTags";

// In your component:
const includedValues = useReactiveVar(tagFilterIncludedValuesVar);
const excludedValues = useReactiveVar(tagFilterExcludedValuesVar);

const { includedFilterValue, excludedFilterValue } = useTagFilterDashboard(
  includedValues,
  excludedValues,
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
- Excluded tags show with `not:` prefix
- Each tag badge has a close button for quick removal

## Testing
- **filterByTags.test.ts**: 9 tests covering all filtering scenarios (100% coverage)
- **DashboardTagFilter.test.tsx**: 4 tests for component rendering and helper functions (100% coverage)
- All tests passing with good coverage metrics

## Files Created
1. `shared-components/statviz/state/tagFilterDashboard.ts`
2. `shared-components/statviz/hooks/useTagFilterDashboard.ts`
3. `shared-components/statviz/utils/filterByTags.ts`
4. `shared-components/statviz/components/filter/DashboardTagFilter.tsx`
5. `shared-components/statviz/components/filter/TabbedTagDropdown.tsx`
6. `shared-components/statviz/components/filter/MultiSelectList.tsx`
7. `shared-components/statviz/utils/filterByTags.test.ts`
8. `shared-components/statviz/components/filter/DashboardTagFilter.test.tsx`

## Files Modified
1. `shared-components/statviz/dashboard/Dashboard.tsx`
2. `shared-components/statviz/components/visualizations/createdBoxes/CreatedBoxesFilterContainer.tsx`
3. `shared-components/statviz/components/visualizations/demographic/DemographicFilterContainer.tsx`
4. `shared-components/statviz/components/visualizations/movedBoxes/MovedBoxesFilterContainer.tsx`
5. `shared-components/statviz/components/visualizations/stock/StockDataFilter.tsx`

## Technical Notes
- Built with TypeScript, React, Chakra UI, and Apollo Client
- Follows existing patterns in the statviz module
- Maintains backward compatibility with existing tag filter
- URL state is fully synchronized with component state
- Generic filter utility can be reused for other filtering needs
