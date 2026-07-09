import { Card, CardBody } from "@chakra-ui/react";
import { useMemo } from "react";
import { groupBy, innerJoin, map, sum, summarize, tidy } from "@tidyjs/tidy";
import { StockOverview, StockOverviewResult } from "../../../../../graphql/types";
import { BoxesOrItemsCount } from "../../../utils/dashboardFilters";
import BarChart from "../../nivo/BarChart";
import VisHeader from "../../VisHeader";
import NoDataCard from "../../NoDataCard";
import getOnExport from "../../../utils/chartExport";
import { PRODUCT_GENDER_COLORS } from "../../../data/colors";

const FALLBACK_COLOR = "#aaaaaa";

interface StockOverviewBarsProps {
  data: StockOverview;
  boxesOrItems: BoxesOrItemsCount;
  width: string;
  height: string;
}

type CategoryGenderRow = { categoryName: string; gender: string; value: number };
type BarRow = { categoryName: string } & Record<string, string | number>;

export default function StockOverviewBars({
  data,
  boxesOrItems,
  width,
  height,
}: StockOverviewBarsProps) {
  const onExport = getOnExport(BarChart);

  const { chartData, genderKeys } = useMemo(() => {
    const facts = (data?.facts ?? []) as StockOverviewResult[];
    const categoryDim = (data?.dimensions?.category ?? []).map((c) => ({
      categoryId: c.id!,
      categoryName: c.name!,
    }));

    const rows = tidy(
      facts,
      innerJoin(categoryDim, { by: "categoryId" }),
      groupBy(["categoryName", "gender"], summarize({ value: sum(boxesOrItems) })),
      map((row) => ({
        categoryName: row.categoryName as string,
        gender: (row.gender as string | null) ?? "none",
        value: (row.value as number) ?? 0,
      })),
    ) as CategoryGenderRow[];

    const uniqueGenders = Array.from(new Set(rows.map((r) => r.gender)));

    // Pivot: one row per category, columns per gender
    const byCategory = new Map<string, BarRow>();
    for (const row of rows) {
      if (!byCategory.has(row.categoryName)) {
        byCategory.set(row.categoryName, { categoryName: row.categoryName });
      }
      byCategory.get(row.categoryName)![row.gender] = row.value;
    }

    return {
      chartData: Array.from(byCategory.values()),
      genderKeys: uniqueGenders,
    };
  }, [data, boxesOrItems]);

  const heading = "Product Categories by Gender";

  if (chartData.length === 0) {
    return <NoDataCard header={heading} />;
  }

  const getColor = (bar: { id: string | number }) =>
    PRODUCT_GENDER_COLORS[String(bar.id)] ?? FALLBACK_COLOR;

  const chartProps = {
    data: chartData,
    indexBy: "categoryName",
    keys: genderKeys,
    width,
    height,
    colors: getColor,
    legend: true,
  };

  return (
    <Card>
      <VisHeader
        heading={heading}
        onExport={onExport}
        defaultHeight={500}
        defaultWidth={600}
        chartProps={chartProps}
      />
      <CardBody>
        <BarChart {...chartProps} animate />
      </CardBody>
    </Card>
  );
}
