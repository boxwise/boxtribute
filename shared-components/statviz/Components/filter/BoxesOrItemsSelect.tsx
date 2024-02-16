import { HStack, Box } from "@chakra-ui/react";
import ValueFilter, { IFilterValue } from "../../filter/ValueFilter";
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

export const defaultBoxesOrItems = boxesOrItemsFilterValues[0];

export default function BoxesOrItemsSelect() {
  const { onFilterChange } = useValueFilter<IBoxesOrItemsFilter>(
    boxesOrItemsFilterValues,
    boxesOrItemsFilterValues[0],
    "boi",
  );

  return (
    <Box>
      <HStack>
        <Box width="250px">
          <ValueFilter
            values={boxesOrItemsFilterValues}
            defaultFilterValue={boxesOrItemsFilterValues[0]}
            placeholder="test"
            onFilterChange={onFilterChange}
            filterId="boi"
          />
        </Box>
      </HStack>
    </Box>
  );
}
