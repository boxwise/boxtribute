import { Wrap, WrapItem, FormLabel, Box, Select } from "@chakra-ui/react";
import { useState, useEffect, ChangeEvent, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { CreatedBoxesData, CreatedBoxesResult } from "../../../types/generated/graphql";
import CreatedBoxesCharts from "./CreatedBoxesCharts";
import { filterListByInterval } from "../../../utils/helpers";
import useTimerange from "../../../hooks/useTimerange";

export type BoxesOrItems = "boxesCount" | "itemsCount";

const isBoxesOrItemsCount = (x: any | undefined): x is BoxesOrItems =>
  x === "boxesCount" || x === "itemsCount";

export default function CreatedBoxesFilterContainer(props: { createdBoxes: CreatedBoxesData }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { interval } = useTimerange();

  const [selectedBoxesOrItems, setSelectedBoxesOrItems] = useState<BoxesOrItems>("boxesCount");

  useEffect(() => {
    const boi = searchParams.get("boi");
    if (isBoxesOrItemsCount(boi)) {
      setSelectedBoxesOrItems(boi);
    } else {
      if (boi !== null) {
        searchParams.delete("boi");
      }
      searchParams.append("boi", selectedBoxesOrItems);
      setSearchParams(searchParams);
    }
  }, [selectedBoxesOrItems, setSelectedBoxesOrItems, searchParams, setSearchParams]);

  const onBoxesItemsSelectChange = (event: ChangeEvent) => {
    const selected = event.target.selectedOptions.item(0).value as BoxesOrItems;

    // boi short for boxes or items (see type BoxesOrItems)
    if (searchParams.get("boi")) {
      searchParams.delete("boi");
    }

    searchParams.append("boi", selected);

    setSearchParams(searchParams);
  };

  const createdBoxesFacts = useMemo(() => {
    try {
      return filterListByInterval(
        props.createdBoxes.facts as CreatedBoxesResult[],
        "createdOn",
        interval,
      ) as CreatedBoxesResult[];
    } catch (error) {
      // TODO show toast with error message?
    }
    return [];
  }, [interval, props.createdBoxes.facts]);

  const filteredCreatedBoxesCube = {
    facts: createdBoxesFacts,
    dimensions: props.createdBoxes.dimensions,
  };
  return (
    <>
      <Wrap borderWidth="1px" borderRadius="12px" padding="5" marginBottom="30px">
        <WrapItem>
          <Box width="250px">
            <FormLabel htmlFor="box-item-select">Display by</FormLabel>
            <Select
              onChange={onBoxesItemsSelectChange}
              name="box-item-select"
              defaultValue={selectedBoxesOrItems}
            >
              <option value="boxesCount">Boxes</option>
              <option value="itemsCount">Items</option>
            </Select>
          </Box>
        </WrapItem>
      </Wrap>
      <CreatedBoxesCharts data={filteredCreatedBoxesCube} boxesOrItems={selectedBoxesOrItems} />
    </>
  );
}
