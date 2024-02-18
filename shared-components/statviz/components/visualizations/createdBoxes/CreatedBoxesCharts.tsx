import { Wrap, WrapItem, Box } from "@chakra-ui/react";
import { CreatedBoxesData } from "../../../../types/generated/graphql";
import CreatedBoxes from "./CreatedBoxes";
import TopCreatedProducts from "./TopCreatedProducts";
import { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";

export default function CreatedBoxesCharts(props: {
  data: CreatedBoxesData;
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
