import { Box, Card, CardBody, HStack, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { LineSeries } from "@nivo/line";
import { filter, groupBy, map, summarize, sum, tidy } from "@tidyjs/tidy";
import { eachMonthOfInterval, format, subMonths } from "date-fns";
import { useMemo } from "react";
import { MovedBoxes, MovedBoxesResult } from "../../../../../graphql/types";
import type { BoxesOrItems } from "../../filter/BoxesOrItemsSelect";
import LineChart from "../../nivo/LineChart";
import NoDataCard from "../../NoDataCard";
import VisHeader from "../../VisHeader";
import getOnExport from "../../../utils/chartExport";
import type { MovementDirection } from "../../../utils/dashboardFilters";

const seriesColors = [
  "#29335f",
  "#ef404a",
  "#60a561",
  "#d89016",
  "#6cdb2c",
  "#9467bd",
  "#2287bd",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
];

interface ShipmentsOverTimeChartProps {
  movedBoxes: Partial<MovedBoxes>;
  boxesOrItems: BoxesOrItems;
  direction: MovementDirection;
}

export default function ShipmentsOverTimeChart({
  movedBoxes,
  boxesOrItems,
  direction,
}: ShipmentsOverTimeChartProps) {
  const onExport = getOnExport(LineChart);
  const heading = `${direction === "out" ? "Outgoing" : "Incoming"} Shipments over Time`;

  const { chartData, colors } = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 11),
      end: new Date(),
    }).map((month) => format(month, "yyyy-MM"));
    const monthSet = new Set(months);
    const facts = (movedBoxes?.facts ?? []) as MovedBoxesResult[];
    const targetTypes = new Map(
      (movedBoxes?.dimensions?.target ?? [])
        .filter((target): target is NonNullable<typeof target> => target !== null)
        .map((target) => [target.id, target.type]),
    );

    const groupedFacts = tidy(
      facts,
      map((fact) => ({
        ...fact,
        targetType: targetTypes.get(fact.targetId) ?? null,
      })),
      filter((fact) =>
        direction === "out"
          ? fact.targetType === "OutgoingShipment"
          : fact.targetType === "IncomingShipment",
      ),
      map((fact) => ({
        ...fact,
        month: format(new Date(fact.movedOn), "yyyy-MM"),
        organisationLabel: fact.organisationName ?? "Unknown",
        chartValue: Math.abs(fact[boxesOrItems] ?? 0),
      })),
      filter((fact) => monthSet.has(fact.month)),
      groupBy(["organisationLabel", "month"], [summarize({ value: sum("chartValue") })]),
    ) as Array<{ organisationLabel: string; month: string; value: number }>;

    const organisationNames = Array.from(
      new Set(groupedFacts.map((fact) => fact.organisationLabel)),
    ).sort((left, right) => left.localeCompare(right));

    const valueLookup = new Map(
      groupedFacts.map((fact) => [`${fact.organisationLabel}::${fact.month}`, fact.value]),
    );

    const data = organisationNames.map((organisationName) => ({
      id: organisationName,
      data: months.map((month) => ({
        x: month,
        y: valueLookup.get(`${organisationName}::${month}`) ?? 0,
      })),
    })) as LineSeries[];

    return {
      chartData: data,
      colors: organisationNames.map((_, index) => seriesColors[index % seriesColors.length]),
    };
  }, [movedBoxes, boxesOrItems, direction]);

  const chartProps = {
    data: chartData,
    width: "800px",
    height: "400px",
    colors,
  };

  if (chartData.length === 0) {
    return <NoDataCard header={heading} />;
  }

  return (
    <Card overflow="auto">
      <VisHeader
        onExport={onExport}
        defaultHeight={400}
        defaultWidth={800}
        heading={heading}
        chartProps={chartProps}
        maxWidthPx={900}
      />
      <CardBody>
        <LineChart {...chartProps} animate />
        <Wrap mt={4} spacing={4}>
          {chartData.map((series, index) => (
            <WrapItem key={series.id}>
              <HStack spacing={2}>
                <Box w="12px" h="12px" backgroundColor={colors[index]} borderRadius="sm" />
                <Text>{String(series.id)}</Text>
              </HStack>
            </WrapItem>
          ))}
        </Wrap>
      </CardBody>
    </Card>
  );
}
