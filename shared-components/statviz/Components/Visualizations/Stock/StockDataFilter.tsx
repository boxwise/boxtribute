import { StockOverviewData } from "../../../../types/generated/graphql";
import StockCharts from "./StockCharts";

interface IStockDataFilterProps {
  stockOverview: StockOverviewData;
}

export default function StockDataFilter({ stockOverview }: IStockDataFilterProps) {
  // currently not affected by the selected timerange

  return <StockCharts stockOverview={stockOverview} />;
}
