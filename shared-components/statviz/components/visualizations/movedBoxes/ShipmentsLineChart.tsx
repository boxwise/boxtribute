import { Box, Card, CardBody, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { groupBy, sum, summarize, tidy } from "@tidyjs/tidy";
import { useMemo } from "react";
import { format } from "date-fns";
import LineChart, { ILineChartSeries } from "../../nivo/LineChart";
import VisHeader from "../../VisHeader";
import getOnExport from "../../../utils/chartExport";
import { BoxesOrItemsCount } from "../../../dashboard/ItemsAndBoxes";
import NoDataCard from "../../NoDataCard";
import { MovedBoxes, MovedBoxesResult } from "../../../../../graphql/types";

interface IShipmentsLineChartProps {
  width: string;
  height: string;
  data: Partial<MovedBoxes>;
  boxesOrItems: BoxesOrItemsCount;
  isIncoming: boolean;
}

const MONTH_FORMAT = "MMM yyyy";

export default function ShipmentsLineChart({
  width,
  height,
  data,
  boxesOrItems,
  isIncoming,
}: IShipmentsLineChartProps) {
  const onExport = getOnExport(LineChart);

  const heading = isIncoming
    ? boxesOrItems === "boxesCount"
      ? "Incoming Boxes per Month by Organisation"
      : "Incoming Items per Month by Organisation"
    : boxesOrItems === "boxesCount"
      ? "Outgoing Boxes per Month by Organisation"
      : "Outgoing Items per Month by Organisation";

  const { chartData, organisations } = useMemo(() => {
    const facts = data?.facts as MovedBoxesResult[];
    const targetDimension = data?.dimensions?.target;

    if (!facts || !targetDimension) return { chartData: [], organisations: [] };

    // Build lookup map: targetId -> type
    const typeMap = new Map(
      targetDimension.map((t) => [t?.id ?? "", t?.type ?? ""] as [string, string]),
    );

    // Filter to shipment types only (OutgoingShipment or IncomingShipment based on toggle)
    const targetType = isIncoming ? "IncomingShipment" : "OutgoingShipment";
    const filtered = facts.filter((f) => typeMap.get(f.targetId) === targetType);

    if (filtered.length === 0) return { chartData: [], organisations: [] };

    // Annotate each fact with its month label
    const withMonth = filtered.map((f) => ({
      month: format(new Date(`${f.movedOn}T00:00:00`), MONTH_FORMAT),
      organisationName: f.organisationName ?? "Unknown",
      boxesCount: f.boxesCount ?? 0,
      itemsCount: f.itemsCount ?? 0,
    }));

    // Collect all unique months sorted chronologically
    const allMonths = Array.from(new Set(withMonth.map((f) => f.month))).sort((a, b) => {
      const dateA = new Date(`01 ${a}`);
      const dateB = new Date(`01 ${b}`);
      return dateA.getTime() - dateB.getTime();
    });

    // Collect all unique organisations
    const allOrgs = Array.from(new Set(withMonth.map((f) => f.organisationName)));

    // Build nivo line chart series: one series per organisation
    const series: ILineChartSeries[] = allOrgs.map((org) => {
      const orgFacts = withMonth.filter((f) => f.organisationName === org);

      const byMonth = tidy(
        orgFacts,
        groupBy(["month"], [summarize({ count: sum(boxesOrItems) })]),
      ) as { month: string; count: number }[];

      const byMonthMap = new Map(byMonth.map((row) => [row.month, row.count]));

      return {
        id: org,
        data: allMonths.map((month) => ({
          x: month,
          y: byMonthMap.get(month) ?? 0,
        })),
      };
    });

    return { chartData: series, organisations: allOrgs };
  }, [data, boxesOrItems, isIncoming]);

  const chartProps = {
    data: chartData,
    width,
    height,
    labelAxisBottom: "Month",
    labelAxisLeft: boxesOrItems === "boxesCount" ? "Boxes" : "Items",
  };

  if (chartData.length === 0) {
    return <NoDataCard header={heading} />;
  }

  return (
    <Card>
      <VisHeader
        onExport={onExport}
        defaultHeight={400}
        defaultWidth={900}
        heading={heading}
        chartProps={chartProps}
        maxWidthPx={900}
      />
      <CardBody>
        <LineChart {...chartProps} animate />
        <Wrap mt={4} spacing={4}>
          {organisations.map((org) => (
            <WrapItem key={org} alignItems="center">
              <Box mr={1} display="inline-block">
                <Text fontSize="sm" fontWeight="medium">
                  {org}
                </Text>
              </Box>
            </WrapItem>
          ))}
        </Wrap>
      </CardBody>
    </Card>
  );
}
