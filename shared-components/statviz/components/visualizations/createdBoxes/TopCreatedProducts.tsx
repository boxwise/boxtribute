import { Card, CardBody } from "@chakra-ui/react";
import { useMemo } from "react";
import { arrange, desc, groupBy, innerJoin, map, sum, summarize, tidy } from "@tidyjs/tidy";
import BarChart from "../../nivo/BarChart";
import {
  CreatedBoxesData,
  CreatedBoxesResult,
  ProductDimensionInfo,
} from "../../../../types/generated/graphql";
import VisHeader from "../../VisHeader";
import getOnExport from "../../../utils/chartExport";
import NoDataCard from "../../NoDataCard";

const visId = "top-products";

export default function TopCreatedProducts(props: {
  width: string;
  height: string;
  boxesOrItems: string;
  data: CreatedBoxesData;
}) {
  const onExport = getOnExport(BarChart);
  const { boxesOrItems, data } = { ...props };

  const getChartData = () =>
    tidy(
      data.facts as CreatedBoxesResult[],
      map((row) => ({ ...row, productId: row.productId })),
      groupBy(
        ["productId", "gender"],
        [
          summarize({
            itemsCount: sum("itemsCount"),
            boxesCount: sum("boxesCount"),
          }),
        ],
      ),
      innerJoin(data.dimensions?.product as ProductDimensionInfo[], { by: { id: "productId" } }),
      map((row) => ({
        id: `${row.name} (${row.gender})`,
        value: row[boxesOrItems],
        label: `${row[boxesOrItems]}`,
      })),
      arrange([desc("value")]),
    ).splice(0, 5);

  const chartData = useMemo(getChartData, [data, boxesOrItems]);

  const chartProps = {
    visId: "visId",
    data: chartData,
    width: props.width,
    height: props.height,
  };

  const topProductsHeading = boxesOrItems === "boxesCount" ? "boxes" : "items";
  const heading = `Top Products by ${topProductsHeading}`;

  if (chartData.length === 0) {
    return <NoDataCard header={heading} />;
  }

  return (
    <Card>
      <VisHeader
        maxWidthPx={props.width}
        heading={heading}
        visId={visId}
        onExport={onExport}
        defaultHeight={500}
        defaultWidth={500}
        chartProps={chartProps}
      />
      <CardBody>
        <BarChart {...chartProps} />
      </CardBody>
    </Card>
  );
}
