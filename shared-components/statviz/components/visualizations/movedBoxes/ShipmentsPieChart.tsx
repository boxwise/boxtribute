import { Card, CardBody, FormLabel, Wrap, WrapItem } from "@chakra-ui/react";
import { groupBy, map, sum, summarize, tidy } from "@tidyjs/tidy";
import { useMemo } from "react";
import PieChart from "../../nivo/PieChart";
import VisHeader from "../../VisHeader";
import getOnExport from "../../../utils/chartExport";
import { BoxesOrItemsCount } from "../../../dashboard/ItemsAndBoxes";
import NoDataCard from "../../NoDataCard";
import useValueFilter from "../../../hooks/useValueFilter";
import ValueFilter, { IFilterValue } from "../../filter/ValueFilter";
import { MovedBoxes, MovedBoxesResult } from "../../../../../graphql/types";

const groupOptions: (IFilterValue & { value: string })[] = [
  { value: "categoryName", label: "Category", urlId: "cn" },
  { value: "productName", label: "Product", urlId: "pn" },
  { value: "gender", label: "Gender", urlId: "g" },
];

// smg = shipments grouping
const filterId = "smg";

interface IShipmentsPieChartProps {
  width: string;
  height: string;
  data: Partial<MovedBoxes>;
  boxesOrItems: BoxesOrItemsCount;
  isIncoming: boolean;
}

interface IEnrichedFact {
  categoryName: string;
  productName: string;
  gender: string;
  boxesCount: number;
  itemsCount: number;
}

export default function ShipmentsPieChart({
  width,
  height,
  data,
  boxesOrItems,
  isIncoming,
}: IShipmentsPieChartProps) {
  const onExport = getOnExport(PieChart);

  const { onFilterChange, filterValue } = useValueFilter(groupOptions, groupOptions[0], filterId);

  const heading = isIncoming
    ? boxesOrItems === "boxesCount"
      ? "Incoming Shipments by Category"
      : "Incoming Shipment Items by Category"
    : boxesOrItems === "boxesCount"
      ? "Outgoing Shipments by Category"
      : "Outgoing Shipment Items by Category";

  const chartData = useMemo(() => {
    const facts = data?.facts as MovedBoxesResult[];
    const targetDimension = data?.dimensions?.target;

    if (!facts || !targetDimension) return [];

    // Build lookup map: targetId -> type
    const typeMap = new Map(
      targetDimension.map((t) => [t?.id ?? "", t?.type ?? ""] as [string, string]),
    );

    // Build lookup map: categoryId -> categoryName
    const categoryMap = new Map(
      (data?.dimensions?.category ?? []).map(
        (c) => [c?.id ?? 0, c?.name ?? "Unknown"] as [number, string],
      ),
    );

    // Filter facts by direction
    const filtered = facts.filter((f) => {
      const type = typeMap.get(f.targetId);
      return isIncoming ? type === "IncomingShipment" : type !== "IncomingShipment";
    });

    // Enrich with categoryName
    const enriched: IEnrichedFact[] = filtered.map((f) => ({
      categoryName: categoryMap.get(f.categoryId) ?? "Unknown",
      productName: f.productName ?? "Unknown",
      gender: f.gender ?? "Unknown",
      boxesCount: f.boxesCount ?? 0,
      itemsCount: f.itemsCount ?? 0,
    }));

    const groupKey = filterValue.value as keyof IEnrichedFact;

    const grouped = tidy(
      enriched,
      groupBy([groupKey], [summarize({ count: sum(boxesOrItems) })]),
      map((row: Record<string, unknown>) => ({
        id: String(row[groupKey] ?? "Unknown"),
        value: (row.count as number) ?? 0,
      })),
    );

    return grouped as { id: string; value: number }[];
  }, [data, boxesOrItems, isIncoming, filterValue]);

  const chartProps = {
    data: chartData,
    width,
    height,
  };

  if (chartData.length === 0) {
    return <NoDataCard header={heading} />;
  }

  return (
    <Card>
      <VisHeader
        onExport={onExport}
        defaultHeight={600}
        defaultWidth={600}
        heading={heading}
        chartProps={chartProps}
        maxWidthPx={600}
      />
      <CardBody>
        <Wrap align="end">
          <WrapItem>
            <FormLabel />
            <ValueFilter
              values={groupOptions}
              defaultFilterValue={groupOptions[0]}
              onFilterChange={onFilterChange}
              filterId={filterId}
            />
          </WrapItem>
        </Wrap>
        <PieChart {...chartProps} animate />
      </CardBody>
    </Card>
  );
}
