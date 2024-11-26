import { Wrap, WrapItem } from "@chakra-ui/react";
import BoxFlowSankey from "./BoxFlowSankey";
import { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";
import { MovedBoxes } from "../../../../../front/src/types/query-types";

interface IMovedBoxesChartsProps {
  movedBoxes: MovedBoxes;
  boxesOrItems: BoxesOrItems;
}

export default function MovedBoxesCharts({ movedBoxes, boxesOrItems }: IMovedBoxesChartsProps) {
  return (
    <Wrap gap={6}>
      <WrapItem overflow="auto" padding="5px">
        <BoxFlowSankey
          boxesOrItems={boxesOrItems}
          data={movedBoxes}
          width="1000px"
          height="600px"
        />
      </WrapItem>
    </Wrap>
  );
}
