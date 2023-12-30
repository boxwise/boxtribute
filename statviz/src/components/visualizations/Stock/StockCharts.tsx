import { Wrap, WrapItem } from "@chakra-ui/react";
import { StockOverviewData } from "../../../types/generated/graphql";
import StockOverviewPie from "./StockOverviewPie";

export default function StockCharts(props: { stockOverview: StockOverviewData }) {
  return (
    <Wrap gap={6}>
      <WrapItem>
        <StockOverviewPie width="800px" height="800px" stockOverview={props.stockOverview} />
      </WrapItem>
    </Wrap>
  );
}
