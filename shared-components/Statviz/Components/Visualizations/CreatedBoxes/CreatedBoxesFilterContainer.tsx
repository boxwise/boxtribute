import { Wrap, WrapItem, FormLabel, Box, Select } from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { CreatedBoxesData, CreatedBoxesResult } from "../../../../types/generated/graphql";
import CreatedBoxesCharts from "./CreatedBoxesCharts";
import { filterListByInterval } from "../../../utils/helpers";
import useTimerange from "../../../hooks/useTimerange";

export type BoxesOrItems = "boxesCount" | "itemsCount";

const isBoxesOrItemsCount = (x: any | undefined): x is BoxesOrItems =>
  x === "boxesCount" || x === "itemsCount";

interface ICreatedBoxesFilterContainerProps {
  createdBoxes: CreatedBoxesData;
}

export default function CreatedBoxesFilterContainer({
  createdBoxes,
}: ICreatedBoxesFilterContainerProps) {
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

  const onBoxesItemsSelectChange = (event) => {
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
        (createdBoxes.facts as CreatedBoxesResult[]) ?? [],
        "createdOn",
        interval,
      ) as CreatedBoxesResult[];
    } catch (error) {
      // TODO useError
    }
    return [];
  }, [interval, createdBoxes]);
  const filteredCreatedBoxesCube = {
    facts: createdBoxesFacts,
    dimensions: createdBoxes.dimensions,
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
