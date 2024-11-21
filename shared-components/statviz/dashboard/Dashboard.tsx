import { Accordion, Center, Heading, Wrap, WrapItem } from "@chakra-ui/react";
import TimeRangeSelect from "../components/filter/TimeRangeSelect";
import Demographics from "./Demographics";
import MovedBoxes from "./MovedBoxes";
import ItemsAndBoxes from "./ItemsAndBoxes";
import StockOverview from "./StockOverview";
import BoxesOrItemsSelect, {
  boxesOrItemsFilterValues,
} from "../components/filter/BoxesOrItemsSelect";
import GenderProductFilter from "../components/filter/GenderProductFilter";
import TagFilter from "../components/filter/TagFilter";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { date2String } from "../../utils/helpers";
import { subMonths } from "date-fns";

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  // set default filter states
  // TODO: this is a quick fix and we should revisit the state handling of filters since it seems to be all over the place.
  useEffect(() => {
    const currentQuery = searchParams.toString();
    const newSearchParams = searchParams;

    // TimeRangeFilter
    if (!searchParams.get("from")) {
      newSearchParams.append("from", date2String(subMonths(new Date(), 3)));
    }
    if (!searchParams.get("to")) {
      newSearchParams.append("to", date2String(new Date()));
    }
    if (!searchParams.get("boi")) {
      newSearchParams.append("boi", boxesOrItemsFilterValues[0].urlId);
    }

    if (newSearchParams.toString() !== currentQuery) {
      setSearchParams(newSearchParams);
    }
  }, [searchParams, setSearchParams]);

  return (
    <div>
      <Heading style={{ marginBottom: "15px" }}>Dashboard</Heading>

      <Wrap
        borderWidth="1"
        spacing="10"
        direction={["column", "row"]}
        padding="15"
        marginBottom="15"
        shadow="md"
        pos="sticky"
        top="0"
        background="white"
        zIndex={2}
      >
        <WrapItem w="350">
          <Center>
            <TimeRangeSelect />
          </Center>
        </WrapItem>
        <WrapItem w="150">
          <Center>
            <BoxesOrItemsSelect />
          </Center>
        </WrapItem>
        <WrapItem w="700">
          <Center>
            <GenderProductFilter />
          </Center>
        </WrapItem>
        <WrapItem w="350">
          <Center>
            <TagFilter />
          </Center>
        </WrapItem>
      </Wrap>

      <Accordion defaultIndex={[0]} allowMultiple marginBottom="100px">
        <ItemsAndBoxes />
        <MovedBoxes />
        <Demographics />
        <StockOverview />
      </Accordion>
    </div>
  );
}
