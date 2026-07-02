import { Card, CardBody, Wrap, WrapItem } from "@chakra-ui/react";
import { groupBy, map, summarize, sum, tidy } from "@tidyjs/tidy";
import { useMemo } from "react";
import { MovedBoxes, MovedBoxesResult } from "../../../../../graphql/types";
import type { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";
import ValueFilter, { IFilterValue } from "../../filter/ValueFilter";
import useValueFilter from "../../../hooks/useValueFilter";
import type { MovementDirection } from "../../../utils/dashboardFilters";
import getOnExport from "../../../utils/chartExport";
import PieChart from "../../nivo/PieChart";
import NoDataCard from "../../NoDataCard";
import VisHeader from "../../VisHeader";

type PieData = { id: string; value: number };

const shipmentPieGroupingOptions: IFilterValue[] = [
  { value: "categoryName", label: "Category", urlId: "cat" },
  { value: "productName", label: "Product", urlId: "prod" },
  { value: "gender", label: "Gender", urlId: "gen" },
  { value: "sizeName", label: "Size", urlId: "siz" },
];

const defaultShipmentPieGrouping = shipmentPieGroupingOptions[0];
const shipmentPieGroupingUrlId = "spg";

interface ShipmentsPieChartProps {
  movedBoxes: Partial<MovedBoxes>;
  boxesOrItems: BoxesOrItems;
  direction: MovementDirection;
}

export default function ShipmentsPieChart({
  movedBoxes,
  boxesOrItems,
  direction,
}: ShipmentsPieChartProps) {
  const onExport = getOnExport(PieChart);
  const { onFilterChange, filterValue: groupingOption } = useValueFilter(
    shipmentPieGroupingOptions,
    defaultShipmentPieGrouping,
    shipmentPieGroupingUrlId,
  );

  const chartData = useMemo<PieData[]>(() => {
    const facts = (movedBoxes?.facts ?? []) as MovedBoxesResult[];
    const targetTypes = new Map(
      (movedBoxes?.dimensions?.target ?? [])
        .filter((target): target is NonNullable<typeof target> => target !== null)
        .map((target) => [target.id, target.type]),
    );
    const categoryNames = new Map(
      (movedBoxes?.dimensions?.category ?? [])
        .filter((category): category is NonNullable<typeof category> => category !== null)
        .map((category) => [category.id, category.name ?? "N/A"]),
    );
    const sizeNames = new Map(
      (movedBoxes?.dimensions?.size ?? [])
        .filter((size): size is NonNullable<typeof size> => size !== null)
        .map((size) => [size.id, size.name ?? "N/A"]),
    );

    const directionFacts = tidy(
      facts,
      map((fact) => ({
        ...fact,
        targetType: targetTypes.get(fact.targetId) ?? null,
        chartValue: Math.abs(fact[boxesOrItems] ?? 0),
        categoryName: categoryNames.get(fact.categoryId ?? null) ?? "N/A",
        sizeName: sizeNames.get(fact.sizeId ?? null) ?? "N/A",
      })),
      map((fact) => ({
        ...fact,
        include:
          direction === "out"
            ? fact.targetType !== "IncomingShipment"
            : fact.targetType === "IncomingShipment",
      })),
    ).filter((fact) => fact.include);

    if (groupingOption.value === "categoryName") {
      return tidy(
        directionFacts,
        groupBy("categoryName", [summarize({ value: sum("chartValue") })]),
        map((row) => ({ id: row.categoryName as string, value: row.value as number })),
      ) as PieData[];
    }

    if (groupingOption.value === "sizeName") {
      return tidy(
        directionFacts,
        groupBy("sizeName", [summarize({ value: sum("chartValue") })]),
        map((row) => ({ id: row.sizeName as string, value: row.value as number })),
      ) as PieData[];
    }

    if (groupingOption.value === "productName") {
      return tidy(
        directionFacts,
        groupBy("productName", [summarize({ value: sum("chartValue") })]),
        map((row) => ({
          id: (row.productName as string | null) ?? "N/A",
          value: row.value as number,
        })),
      ) as PieData[];
    }

    return tidy(
      directionFacts,
      groupBy("gender", [summarize({ value: sum("chartValue") })]),
      map((row) => ({
        id: (row.gender as string | null) ?? "N/A",
        value: row.value as number,
      })),
    ) as PieData[];
  }, [movedBoxes, boxesOrItems, direction, groupingOption.value]);

  const heading = `${direction === "out" ? "Outgoing" : "Incoming"} Shipments by ${
    groupingOption.label
  }`;
  const chartProps = {
    data: chartData,
    width: "500px",
    height: "500px",
  };

  if (chartData.length === 0) {
    return <NoDataCard header={heading} />;
  }

  return (
    <Card>
      <VisHeader
        onExport={onExport}
        defaultHeight={500}
        defaultWidth={500}
        heading={heading}
        chartProps={chartProps}
      />
      <CardBody>
        <Wrap mb={4}>
          <WrapItem>
            <ValueFilter
              values={shipmentPieGroupingOptions}
              defaultFilterValue={defaultShipmentPieGrouping}
              onFilterChange={onFilterChange}
              filterId={shipmentPieGroupingUrlId}
              fieldLabel="Group by"
              inlineLabel={true}
            />
          </WrapItem>
        </Wrap>
        <PieChart {...chartProps} animate />
      </CardBody>
    </Card>
  );
}
