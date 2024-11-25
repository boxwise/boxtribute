import { Wrap, WrapItem } from "@chakra-ui/react";
import StockOverviewPie from "./StockOverviewPie";
import { BoxesOrItemsCount } from "../../../dashboard/ItemsAndBoxes";

interface IStockChartProps {
  stockOverview: StockOverviewData;
  boxesOrItems: BoxesOrItemsCount;
}

export default function StockCharts({ stockOverview, boxesOrItems }: IStockChartProps) {
  return (
    <Wrap gap={6}>
      <WrapItem>
        <StockOverviewPie
          width="800px"
          height="800px"
          boxesOrItems={boxesOrItems}
          data={stockOverview}
        />
      </WrapItem>
    </Wrap>
  );
}
