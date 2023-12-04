import {
  AccordionItem,
  AccordionButton,
  Heading,
  AccordionIcon,
  AccordionPanel,
  Wrap,
  WrapItem,
  FormLabel,
  SelectField,
  Box,
} from "@chakra-ui/react";
import BoxFlowSankey from "./BoxFlowSankey";
import { MovedBoxesData } from "../../../types/generated/graphql";

export default function MovedBoxesCharts(props: {
  movedBoxes: MovedBoxesData;
}) {
  return (
    <Wrap gap={6}>
      <WrapItem overflow="auto" padding="5px">
        <BoxFlowSankey
          movedBoxes={props.movedBoxes}
          width="1000px"
          height="600px"
        />
      </WrapItem>
    </Wrap>
  );
}
