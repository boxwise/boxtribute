import ValueFilter, { IFilterValue } from "./ValueFilter";
import useValueFilter from "../../hooks/useValueFilter";

export type CreatedBoxesTimeGroupOption = "day" | "week" | "month" | "year";

export interface ICreatedBoxesTimeGroupOption {
  value: CreatedBoxesTimeGroupOption;
}

export const createdBoxesGroupingOptions: (IFilterValue & ICreatedBoxesTimeGroupOption)[] = [
  {
    value: "year",
    urlId: "y",
    label: "year",
  },
  {
    value: "month",
    urlId: "m",
    label: "month",
  },
  {
    value: "week",
    urlId: "w",
    label: "week",
  },
  {
    value: "day",
    urlId: "d",
    label: "day",
  },
];

// cbg = created boxes grouping
export const createdBoxesUrlId = "cbg";

// weekly grouping is default
export const defaultCreatedBoxesGrouping = createdBoxesGroupingOptions[1];

export default function CreatedBoxesGrouping() {
  const { onFilterChange } = useValueFilter<ICreatedBoxesTimeGroupOption>(
    createdBoxesGroupingOptions,
    defaultCreatedBoxesGrouping,
    createdBoxesUrlId,
  );

  return (
    <ValueFilter
      values={createdBoxesGroupingOptions}
      defaultFilterValue={defaultCreatedBoxesGrouping}
      placeholder={defaultCreatedBoxesGrouping.label}
      onFilterChange={onFilterChange}
      filterId={createdBoxesUrlId}
    />
  );
}
