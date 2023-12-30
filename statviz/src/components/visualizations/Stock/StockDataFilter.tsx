import { useMemo } from "react";
import {
  StockOverviewData,
  StockOverviewResult,
} from "../../../types/generated/graphql";
import StockCharts from "./StockCharts";
import { filterListByInterval } from "../../../utils/helpers";
import useTimerange from "../../../hooks/useTimerange";

export default function StockDataFilter(props: {
  stockOverview: StockOverviewData;
}) {
  // currently not affected by the selected timerange

  return <StockCharts stockOverview={props.stockOverview} />;
}
