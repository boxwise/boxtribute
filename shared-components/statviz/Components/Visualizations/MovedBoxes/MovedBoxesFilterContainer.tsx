import { useMemo } from "react";
import useTimerange from "../../../hooks/useTimerange";
import { MovedBoxesData, MovedBoxesResult } from "../../../../types/generated/graphql";
import { filterListByInterval } from "../../../../utils/helpers";
import MovedBoxesCharts from "./MovedBoxesCharts";
import useValueFilter from "../../../hooks/useValueFilter";
import { boxesOrItemsFilterValues, defaultBoxesOrItems } from "../../filter/BoxesOrItemsSelect";

export default function MovedBoxesFilterContainer(props: { movedBoxes: MovedBoxesData }) {
  const { interval } = useTimerange();

  const { filterValue } = useValueFilter(boxesOrItemsFilterValues, defaultBoxesOrItems, "boi");

  const movedBoxesFacts = useMemo(() => {
    try {
      return filterListByInterval(
        props.movedBoxes.facts as MovedBoxesResult[],
        "movedOn",
        interval,
      ) as MovedBoxesResult[];
    } catch (error) {
      // TODO show toast with error message?
    }
    return [];
  }, [interval, props.movedBoxes.facts]);

  const filteredMovedBoxesCube = {
    facts: movedBoxesFacts,
    dimensions: props.movedBoxes.dimensions,
  };
  return <MovedBoxesCharts movedBoxes={filteredMovedBoxesCube} boxesOrItems={filterValue.value} />;
}
