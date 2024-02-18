import { Wrap, WrapItem } from "@chakra-ui/react";
import BoxFlowSankey from "./BoxFlowSankey";
import { MovedBoxesData } from "../../../../types/generated/graphql";
import { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";

interface IMovedBoxesChartsProps {
  movedBoxes: MovedBoxesData;
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
