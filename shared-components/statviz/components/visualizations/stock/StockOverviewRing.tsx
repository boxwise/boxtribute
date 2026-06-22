import { Card, CardBody } from "@chakra-ui/react";
import { useMemo } from "react";
import { groupBy, innerJoin, map, sum, summarize, tidy } from "@tidyjs/tidy";
import { StockOverview, StockOverviewResult } from "../../../../../graphql/types";
import { BoxesOrItemsCount } from "../../../dashboard/ItemsAndBoxes";
import PieChart from "../../nivo/PieChart";
import VisHeader from "../../VisHeader";
import getOnExport from "../../../utils/chartExport";

type PieData = { id: string; value: number };

interface StockOverviewRingProps {
  data: StockOverview;
  boxesOrItems: BoxesOrItemsCount;
  width: string;
  height: string;
}

export default function StockOverviewRing({
  data,
  boxesOrItems,
  width,
  height,
}: StockOverviewRingProps) {
  const onExport = getOnExport(PieChart);

  const chartData = useMemo<PieData[]>(() => {
    const categoryDim = (data?.dimensions?.category ?? []).map((c) => ({
      categoryId: c.id!,
      categoryName: c.name!,
    }));

    return tidy(
      (data?.facts ?? []) as StockOverviewResult[],
      innerJoin(categoryDim, { by: "categoryId" }),
      groupBy("categoryName", summarize({ value: sum(boxesOrItems) })),
      map((row) => ({
        id: row.categoryName as string,
        value: row.value as number,
      })),
    ) as PieData[];
  }, [data, boxesOrItems]);

  const total = useMemo(() => chartData.reduce((acc, d) => acc + d.value, 0), [chartData]);

  const heading =
    boxesOrItems === "boxesCount" ? "Instock Boxes by Category" : "Instock Items by Category";

  const centerData = {
    level: total,
    grouping: boxesOrItems === "boxesCount" ? "boxes" : "items",
  };

  const chartProps = {
    data: chartData,
    width,
    height,
  };

  return (
    <Card>
      <VisHeader
        onExport={onExport}
        defaultHeight={500}
        defaultWidth={500}
        heading={heading}
        chartProps={chartProps}
        maxWidthPx={600}
        customIncludes={[{ prop: { centerData }, value: "include center data" }]}
      />
      <CardBody>
        <PieChart {...chartProps} centerData={centerData} animate />
      </CardBody>
    </Card>
  );
}
