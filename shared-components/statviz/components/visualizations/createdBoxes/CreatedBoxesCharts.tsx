import { Wrap, WrapItem, Box } from "@chakra-ui/react";
import CreatedBoxes from "./CreatedBoxes";
import TopCreatedProducts from "./TopCreatedProducts";
import { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";
import { CreatedBoxes as CreatedBoxesType } from "../../../../../front/src/types/query-types";

export default function CreatedBoxesCharts(props: {
  data: CreatedBoxesType;
  boxesOrItems: BoxesOrItems;
}) {
  return (
    <Wrap gap={6}>
      <WrapItem overflow="auto" padding="5px">
        <Box>
          <CreatedBoxes
            width="900px"
            height="400px"
            boxesOrItems={props.boxesOrItems}
            data={props.data}
          />
        </Box>
      </WrapItem>
      <WrapItem overflow="auto" padding="5px">
        <Box>
          <TopCreatedProducts
            boxesOrItems={props.boxesOrItems}
            data={props.data}
            width="450px"
            height="400px"
          />
        </Box>
      </WrapItem>
    </Wrap>
  );
}
