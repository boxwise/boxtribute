import { Card, CardBody, Wrap, WrapItem } from "@chakra-ui/react";
import { useMemo } from "react";
import { groupBy, innerJoin, map, sum, summarize, tidy } from "@tidyjs/tidy";
import { StockOverview, StockOverviewResult } from "../../../../../graphql/types";
import { BoxesOrItemsCount } from "../../../dashboard/ItemsAndBoxes";
import PieChart from "../../nivo/PieChart";
import VisHeader from "../../VisHeader";
import getOnExport from "../../../utils/chartExport";
import ValueFilter, { IFilterValue } from "../../filter/ValueFilter";
import useValueFilter from "../../../hooks/useValueFilter";

type PieData = { id: string; value: number };

// srg = stock ring grouping
const ringGroupingUrlId = "srg";

const ringGroupingOptions: IFilterValue[] = [
  { value: "categoryName", label: "Category", urlId: "cn" },
  { value: "gender", label: "Gender", urlId: "g" },
  { value: "sizeName", label: "Size", urlId: "s" },
  { value: "locationName", label: "Location", urlId: "l" },
];

const defaultRingGrouping = ringGroupingOptions[0];

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

  const { onFilterChange, filterValue: groupingOption } = useValueFilter(
    ringGroupingOptions,
    defaultRingGrouping,
    ringGroupingUrlId,
  );

  const groupKey = groupingOption.value;

  const chartData = useMemo<PieData[]>(() => {
    const facts = (data?.facts ?? []) as StockOverviewResult[];

    if (groupKey === "categoryName") {
      const categoryDim = (data?.dimensions?.category ?? []).map((c) => ({
        categoryId: c.id!,
        categoryName: c.name!,
      }));
      return tidy(
        facts,
        innerJoin(categoryDim, { by: "categoryId" }),
        groupBy("categoryName", summarize({ value: sum(boxesOrItems) })),
        map((row) => ({ id: row.categoryName as string, value: row.value as number })),
      ) as PieData[];
    }

    if (groupKey === "sizeName") {
      const sizeDim = (data?.dimensions?.size ?? []).map((s) => ({
        sizeId: s.id!,
        sizeName: s.name!,
      }));
      return tidy(
        facts,
        innerJoin(sizeDim, { by: "sizeId" }),
        groupBy("sizeName", summarize({ value: sum(boxesOrItems) })),
        map((row) => ({ id: row.sizeName as string, value: row.value as number })),
      ) as PieData[];
    }

    if (groupKey === "locationName") {
      const locationDim = (data?.dimensions?.location ?? []).map((l) => ({
        locationId: l.id!,
        locationName: l.name!,
      }));
      return tidy(
        facts,
        innerJoin(locationDim, { by: "locationId" }),
        groupBy("locationName", summarize({ value: sum(boxesOrItems) })),
        map((row) => ({ id: row.locationName as string, value: row.value as number })),
      ) as PieData[];
    }

    // groupKey === "gender"
    return tidy(
      facts,
      groupBy("gender", summarize({ value: sum(boxesOrItems) })),
      map((row) => ({
        id: (row.gender as string | null) ?? "Unknown",
        value: row.value as number,
      })),
    ) as PieData[];
  }, [data, boxesOrItems, groupKey]);

  const total = useMemo(() => chartData.reduce((acc, d) => acc + d.value, 0), [chartData]);

  const groupLabel = groupingOption.label;
  const heading =
    boxesOrItems === "boxesCount"
      ? `Instock Boxes by ${groupLabel}`
      : `Instock Items by ${groupLabel}`;

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
        <Wrap mb={4}>
          <WrapItem>
            <ValueFilter
              values={ringGroupingOptions}
              defaultFilterValue={defaultRingGrouping}
              onFilterChange={onFilterChange}
              filterId={ringGroupingUrlId}
              fieldLabel="Group by"
              inlineLabel={true}
            />
          </WrapItem>
        </Wrap>
        <PieChart {...chartProps} centerData={centerData} animate />
      </CardBody>
    </Card>
  );
}
