import BarChart from "../nivo-graphs/BarChart";
import { Sort, table } from "../../utils/table";
import { ProductDimensionInfo } from "../../types/generated/graphql";
import { ApolloError } from "@apollo/client";
import { Box, Card, CardBody } from "@chakra-ui/react";
import { round } from "lodash";
import { useMemo } from "react";
import { BoxesOrItemsCount } from "../../views/Dashboard/Dashboard";
import VisHeader from "../VisHeader";
import useCreatedBoxes from "../../hooks/useCreatedBoxes";
import NoDataCard from "../NoDataCard";
import useExport from "../../hooks/useExport";

const visId = "top-products";

export default function TopProducts(params: {
  width: string;
  height: string;
  boxesOrItems: BoxesOrItemsCount;
}) {
  const boxesOrItems = params.boxesOrItems;

  const { createdBoxes, loading, error, timerange, data } = useCreatedBoxes();
  const { isExporting, onExport } = useExport("BarChart");

  const getChartData = () => {
    if (data === undefined) {
      return [];
    }

    const products = table(
      data.createdBoxes.dimensions.product as ProductDimensionInfo
    );

    const productCount = createdBoxes.sumColumn(boxesOrItems);

    const top5Products = createdBoxes
      .groupBySum("productId", ["itemsCount", "boxesCount"], ["gender"])
      .orderBy(boxesOrItems, Sort.desc)
      .innerJoin(products, "productId", "id")
      .limit(5);

    return top5Products.data.map((row) => {
      let percent: number = (row[boxesOrItems] * 100) / productCount;
      percent = round(percent, 2);

      return {
        id: `${row.name} (${row.gender})`,
        value: row[boxesOrItems],
        label: `${row[boxesOrItems]} (${percent}%)`,
      };
    });
  };

  const chartData = useMemo(getChartData, [data, createdBoxes, boxesOrItems]);

  const chartProps = {
    visId: "visId",
    data: chartData,
    width: params.width,
    height: params.height,
  };

  if (error instanceof ApolloError) {
    return <p>{error.message}</p>;
  }
  if (loading) {
    return <p>loading...</p>;
  }

  const topProductsHeading = boxesOrItems === "boxesCount" ? "boxes" : "items";
  const heading = "Top Products by " + topProductsHeading;

  if (chartData.length == 0) {
    return <NoDataCard header={heading} />;
  }

  return (
    <Card>
      <VisHeader
        maxWidthPx={params.width}
        heading={heading}
        visId={visId}
        onExport={onExport}
        defaultHeight={500}
        defaultWidth={500}
        chartProps={chartProps}
      ></VisHeader>
      <CardBody>
        <BarChart {...chartProps} />
      </CardBody>
    </Card>
  );
}
