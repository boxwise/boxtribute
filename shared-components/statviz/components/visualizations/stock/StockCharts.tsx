import { Wrap, WrapItem } from "@chakra-ui/react";
import StockOverviewPie from "./StockOverviewPie";
import { BoxesOrItemsCount } from "../../../dashboard/ItemsAndBoxes";
import { StockOverview } from "../../../../../graphql/types";

interface IStockChartProps {
  stockOverview: StockOverview;
  boxesOrItems: BoxesOrItemsCount;
}

export default function StockCharts({ stockOverview, boxesOrItems }: IStockChartProps) {
  return (
    <Wrap gap={6} overflowX="auto">
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
