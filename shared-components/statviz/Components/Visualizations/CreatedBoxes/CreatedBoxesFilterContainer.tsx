import { Wrap, WrapItem, Box } from "@chakra-ui/react";
import { useMemo } from "react";
import { CreatedBoxesData, CreatedBoxesResult } from "../../../../types/generated/graphql";
import CreatedBoxesCharts from "./CreatedBoxesCharts";
import { filterListByInterval } from "../../../../utils/helpers";
import useTimerange from "../../../hooks/useTimerange";
import ValueFilter, { IFilterValue } from "../../../filter/ValueFilter";
import useValueFilter from "../../../hooks/useValueFilter";

interface ICreatedBoxesFilterContainerProps {
  createdBoxes: CreatedBoxesData;
}

export type BoxesOrItems = "boxesCount" | "itemsCount";

interface IBoxesOrItemsFilter {
  value: BoxesOrItems;
}

const boxesOrItemsFilterValues: (IFilterValue & IBoxesOrItemsFilter)[] = [
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

export default function CreatedBoxesFilterContainer({
  createdBoxes,
}: ICreatedBoxesFilterContainerProps) {
  const { interval } = useTimerange();

  const { onFilterChange, filterValue } = useValueFilter<IBoxesOrItemsFilter>(
    boxesOrItemsFilterValues,
    boxesOrItemsFilterValues[0],
    "boi",
  );

  const createdBoxesFacts = useMemo(() => {
    try {
      return filterListByInterval(
        (createdBoxes.facts as CreatedBoxesResult[]) ?? [],
        "createdOn",
        interval,
      ) as CreatedBoxesResult[];
    } catch (error) {
      // TODO useError
    }
    return [];
  }, [interval, createdBoxes]);
  const filteredCreatedBoxesCube = {
    facts: createdBoxesFacts,
    dimensions: createdBoxes.dimensions,
  };

  return (
    <>
      <Wrap borderWidth="1px" borderRadius="12px" padding="5" marginBottom="30px">
        <WrapItem>
          <Box width="250px">
            <ValueFilter
              values={boxesOrItemsFilterValues}
              defaultFilterValue={boxesOrItemsFilterValues[0]}
              placeholder="test"
              onFilterChange={onFilterChange}
              filterId="boi"
            />
          </Box>
        </WrapItem>
      </Wrap>
      <CreatedBoxesCharts data={filteredCreatedBoxesCube} boxesOrItems={filterValue.value} />
    </>
  );
}
