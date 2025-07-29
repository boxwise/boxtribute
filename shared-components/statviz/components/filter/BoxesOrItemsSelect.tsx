import ValueFilter, { IFilterValue } from "./ValueFilter";
import useValueFilter from "../../hooks/useValueFilter";

export type BoxesOrItems = "boxesCount" | "itemsCount";

export interface IBoxesOrItemsFilter {
  value: BoxesOrItems;
}

export const boxesOrItemsFilterValues: (IFilterValue & IBoxesOrItemsFilter)[] = [
  {
    value: "boxesCount",
    urlId: "bc",
    label: "Boxes",
  },
  {
    value: "itemsCount",
    urlId: "ic",
    label: "Items",
  },
];

export const boxesOrItemsUrlId = "boi";

export const defaultBoxesOrItems = boxesOrItemsFilterValues[0];

interface IBoxesOrItemsSelectProps {
  fieldLabel?: string;
  inlineLabel?: boolean;
}

export default function BoxesOrItemsSelect({
  fieldLabel = "display by",
  inlineLabel = false,
}: IBoxesOrItemsSelectProps = {}) {
  const { onFilterChange } = useValueFilter<IBoxesOrItemsFilter>(
    boxesOrItemsFilterValues,
    boxesOrItemsFilterValues[0],
    boxesOrItemsUrlId,
  );

  return (
    <ValueFilter
      values={boxesOrItemsFilterValues}
      defaultFilterValue={boxesOrItemsFilterValues[0]}
      placeholder="Boxes"
      onFilterChange={onFilterChange}
      filterId={boxesOrItemsUrlId}
      fieldLabel={fieldLabel}
      inlineLabel={inlineLabel}
    />
  );
}
