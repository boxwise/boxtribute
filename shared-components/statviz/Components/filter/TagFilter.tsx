import { makeVar, useReactiveVar } from "@apollo/client";
import MultiSelectFilter from "./MultiSelectFilter";
import { IFilterValue } from "./ValueFilter";
import { TagDimensionInfo } from "../../../types/generated/graphql";
import useMultiSelectFilter from "../../hooks/useMultiSelectFilter";

interface ITagFilterValue extends IFilterValue {
  id: number;
}

export const tags = makeVar<ITagFilterValue[]>([]);

export const tagToFilterValue = (tag: TagDimensionInfo): ITagFilterValue => ({
  id: tag.id!,
  value: tag.name!,
  label: tag.name!,
  urlId: tag.id!.toString(),
});

export default function TagFilter() {
  const multiSelectOptions = useReactiveVar(tags);
  const { onFilterChange } = useMultiSelectFilter<ITagFilterValue>(multiSelectOptions, "tagFilter");

  if (multiSelectOptions.length > 0) {
    return (
      <MultiSelectFilter
        onFilterChange={onFilterChange}
        placeholder="Filter Tags"
        filterId="tagFilter"
        values={multiSelectOptions}
      />
    );
  }
  return <span>No tags found</span>;
}
