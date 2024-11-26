import { Wrap, WrapItem } from "@chakra-ui/react";
import StockOverviewPie from "./StockOverviewPie";
import { BoxesOrItemsCount } from "../../../dashboard/ItemsAndBoxes";
import { StockOverview } from "../../../../../front/src/types/query-types";

interface IStockChartProps {
  stockOverview: StockOverview;
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
