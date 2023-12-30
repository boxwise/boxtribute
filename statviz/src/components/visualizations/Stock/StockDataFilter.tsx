import { StockOverviewData } from "../../../types/generated/graphql";
import StockCharts from "./StockCharts";

export default function StockDataFilter(props: { stockOverview: StockOverviewData }) {
  // currently not affected by the selected timerange

  return <StockCharts stockOverview={props.stockOverview} />;
}
