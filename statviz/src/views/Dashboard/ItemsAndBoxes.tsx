import {
  Box,
  AccordionItem,
  AccordionButton,
  Heading,
  AccordionIcon,
  AccordionPanel,
  Wrap,
  WrapItem,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import TopProductsPieChart from "../../components/visualizations/TopProducts";
import CreatedBoxesBarChart from "../../components/visualizations/CreatedBoxes";

export type BoxesOrItemsCount = "boxesCount" | "itemsCount";
export const isBoxesOrItemsCount = (
  x: any | undefined
): x is BoxesOrItemsCount => {
  return x == "boxesCount" || x == "itemsCount";
};

export default function ItemsAndBoxes() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedBoxesOrItems, setSelectedBoxesOrItems] =
    useState<BoxesOrItemsCount>("boxesCount");

  useEffect(() => {
    if (isBoxesOrItemsCount(searchParams.get("boi"))) {
      setSelectedBoxesOrItems(searchParams.get("boi"));
    } else {
      if (searchParams.get("boi") !== null) {
        searchParams.delete("boi");
      }
      searchParams.append("boi", selectedBoxesOrItems);
      setSearchParams(searchParams);
    }
  }, [
    selectedBoxesOrItems,
    setSelectedBoxesOrItems,
    searchParams,
    setSearchParams,
  ]);

  const onBoxesItemsSelectChange = (event: ChangeEvent) => {
    const selected = event.target.selectedOptions.item(0)
      .value as BoxesOrItemsCount;

    // boi short for boxes or items (see type BoxesOrItems)
    if (searchParams.get("boi")) {
      searchParams.delete("boi");
    }

    searchParams.append("boi", selected);

    setSearchParams(searchParams);
  };
  return (
    <AccordionItem>
      <AccordionButton padding="15px 10px">
        <Box as="span" flex="1" textAlign="left">
          <Heading size="lg">Items and Boxes</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <Wrap
          borderWidth="1px"
          borderRadius="12px"
          padding="5"
          marginBottom="30px"
        >
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
        <Wrap gap={6}>
          <WrapItem overflow="auto" padding="5px">
            <Box>
              <CreatedBoxesBarChart
                width="900px"
                height="400px"
                boxesOrItems={selectedBoxesOrItems}
              />
            </Box>
          </WrapItem>
          <WrapItem overflow="auto" padding="5px">
            <Box>
              <TopProductsPieChart
                boxesOrItems={selectedBoxesOrItems}
                width="450px"
                height="400px"
              />
            </Box>
          </WrapItem>
        </Wrap>
      </AccordionPanel>
    </AccordionItem>
  );
}
