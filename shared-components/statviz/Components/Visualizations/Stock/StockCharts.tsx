import { Wrap, WrapItem } from "@chakra-ui/react";
import { StockOverviewData } from "../../../../types/generated/graphql";
import StockOverviewPie from "./StockOverviewPie";

interface IStockChartProps {
  stockOverview: StockOverviewData;
}

export default function StockCharts({ stockOverview }: IStockChartProps) {
  return (
    <Wrap gap={6}>
      <WrapItem>
        <StockOverviewPie width="800px" height="800px" data={stockOverview} />
      </WrapItem>
    </Wrap>
  );
}
