import { Accordion, Center, Heading, Wrap, WrapItem } from "@chakra-ui/react";
import TimeRangeSelect from "../../components/form/TimeRangeSelect";
import Demographics from "./Demographics";
import MovedBoxes from "./MovedBoxes";
import ItemsAndBoxes from "./ItemsAndBoxes";
import StockOverview from "./StockOverview";

export default function Dashboard() {
  const onTimeRangeChange = (from: Date, to: Date) => {
    console.log("Time range changed:", from, to);
  };

  return (
    <div style={{ width: "80%", margin: "25px auto auto auto" }}>
      <Heading borderBottom="1px" borderColor="gray.200" style={{ marginBottom: "25px" }}>
        Dashboard
      </Heading>

      <Wrap
        borderWidth="1px"
        borderRadius="12px"
        spacing="10px"
        direction={["column", "row"]}
        style={{ padding: "20px", marginBottom: "40px" }}
        shadow="md"
      >
        <WrapItem w="350px">
          <Center>
            <TimeRangeSelect onChange={onTimeRangeChange} />
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
