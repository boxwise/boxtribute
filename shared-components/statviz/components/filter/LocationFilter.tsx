import { useReactiveVar } from "@apollo/client";
import useMultiSelectFilter from "../../hooks/useMultiSelectFilter";
import { ITargetFilterValue, targetFilterValuesVar } from "../../state/filter";
import MultiSelectFilter from "./MultiSelectFilter";
import { Tag } from "../../../../front/src/types/query-types";

export const targetFilterId = "loc";

export const targetToFilterValue = (target: Tag): ITargetFilterValue => ({
  id: target.id!,
  value: target.name!,
  label: target.name!,
  urlId: target.id!,
  type: target.type!,
});

export default function Targetfilter() {
  const targetFilterValues = useReactiveVar(targetFilterValuesVar);

  const { onFilterChange, filterValue } = useMultiSelectFilter(targetFilterValues, targetFilterId);

  return (
    <MultiSelectFilter
      onFilterChange={onFilterChange}
      filterValue={filterValue}
      filterId={targetFilterId}
      values={targetFilterValues}
      fieldLabel="hide targets"
      placeholder="hide targets"
    />
  );
}
