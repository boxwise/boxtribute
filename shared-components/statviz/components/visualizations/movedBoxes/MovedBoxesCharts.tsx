import { Box, Button, ButtonGroup, Text, Wrap, WrapItem } from "@chakra-ui/react";
import BoxFlowSankey from "./BoxFlowSankey";
import ShipmentsPieChart from "./ShipmentsPieChart";
import ShipmentsLineChart from "./ShipmentsLineChart";
import { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";
import { MovedBoxes } from "../../../../../graphql/types";
import useValueFilter from "../../../hooks/useValueFilter";
import { shipmentDirectionOptions, shipmentDirectionUrlId } from "./MovedBoxesFilterContainer";

interface IMovedBoxesChartsProps {
  movedBoxes: Partial<MovedBoxes>;
  boxesOrItems: BoxesOrItems;
  isIncoming: boolean;
}

export default function MovedBoxesCharts({
  movedBoxes,
  boxesOrItems,
  isIncoming,
}: IMovedBoxesChartsProps) {
  const { onFilterChange, filterValue: directionFilter } = useValueFilter(
    shipmentDirectionOptions,
    shipmentDirectionOptions[0],
    shipmentDirectionUrlId,
  );

  return (
    <Box>
      <Wrap align="center" mb={4} spacing={3}>
        <WrapItem>
          <Text fontWeight="medium">Direction:</Text>
        </WrapItem>
        <WrapItem>
          <ButtonGroup size="sm" isAttached variant="outline">
            {shipmentDirectionOptions.map((option) => (
              <Button
                key={option.value}
                isActive={directionFilter.value === option.value}
                onClick={() => onFilterChange(option)}
                _active={{ bg: "blue.500", color: "white", borderColor: "blue.500" }}
              >
                {option.label}
              </Button>
            ))}
          </ButtonGroup>
        </WrapItem>
      </Wrap>
      <Wrap gap={6}>
        <WrapItem overflow="auto" padding="5px">
          <BoxFlowSankey
            boxesOrItems={boxesOrItems}
            data={movedBoxes}
            width="1000px"
            height="600px"
            isIncoming={isIncoming}
          />
        </WrapItem>
        <WrapItem overflow="auto" padding="5px">
          <ShipmentsPieChart
            boxesOrItems={boxesOrItems}
            data={movedBoxes}
            width="600px"
            height="600px"
            isIncoming={isIncoming}
          />
        </WrapItem>
      </Wrap>
      <Wrap gap={6} mt={6}>
        <WrapItem overflow="auto" padding="5px">
          <ShipmentsLineChart
            boxesOrItems={boxesOrItems}
            data={movedBoxes}
            width="900px"
            height="400px"
            isIncoming={isIncoming}
          />
        </WrapItem>
      </Wrap>
    </Box>
  );
}
