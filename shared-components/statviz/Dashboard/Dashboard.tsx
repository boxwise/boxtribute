import { Accordion, Center, Heading, Wrap, WrapItem } from "@chakra-ui/react";
import TimeRangeSelect from "../../Form/TimeRangeSelect";
import Demographics from "./Demographics";
import MovedBoxes from "./MovedBoxes";
import ItemsAndBoxes from "./ItemsAndBoxes";
import StockOverview from "./StockOverview";

export default function Dashboard() {
  return (
    <div>
      <Heading style={{ marginBottom: "15px" }}>Dashboard</Heading>

      <Wrap
        borderWidth="1"
        spacing="10"
        direction={["column", "row"]}
        style={{ padding: "15px", marginBottom: "15px" }}
        shadow="md"
      >
        <WrapItem w="350">
          <Center>
            <TimeRangeSelect />
          </Center>
        </WrapItem>
      </Wrap>

      <Accordion defaultIndex={[3]} allowMultiple marginBottom="100px">
        <ItemsAndBoxes />
        <MovedBoxes />
        <Demographics />
        <StockOverview />
      </Accordion>
    </div>
  );
}
