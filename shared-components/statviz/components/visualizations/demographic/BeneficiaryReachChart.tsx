import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  HStack,
  Input,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { BarDatum } from "@nivo/bar";
import { eachMonthOfInterval, format, parseISO } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ResultOf } from "gql.tada";
import {
  AGE_RANGES,
  DemographicsAppliedFilters,
  readBeneReachFiltersFromUrl,
  writeBeneReachFiltersToUrl,
} from "../../../utils/dashboardFilters";
import { filterByTags } from "../../../utils/filterByTags";
import { date2String } from "../../../../utils/helpers";
import BarChart from "../../nivo/BarChart";
import NoDataCard from "../../NoDataCard";
import VisHeader from "../../VisHeader";
import getOnExport from "../../../utils/chartExport";
import { BENEFICIARY_REACH_QUERY } from "../../../queries/queries";

type BeneficiaryReachData = NonNullable<
  ResultOf<typeof BENEFICIARY_REACH_QUERY>["beneficiaryReach"]
>;

const AGE_GROUP_COLORS: Record<string, string> = {
  "0-7": "#4e79a7",
  "8-15": "#f28e2b",
  "16-25": "#e15759",
  "26-40": "#76b7b2",
  "41-65": "#59a14f",
  "66+": "#edc948",
  Unknown: "#b07aa1",
};

const GENDER_COLORS: Record<string, string> = {
  Male: "#31cab5",
  Female: "#ec5063",
  Diverse: "#f3de02",
  Unknown: "#b0b0b0",
};

type BreakdownMode = "age" | "gender";
type MetricMode = "unique" | "interactions";

interface BeneficiaryReachChartProps {
  reachData: BeneficiaryReachData;
  appliedFilters: DemographicsAppliedFilters;
}

function getAgeGroupLabel(age: number | null | undefined): string {
  if (age === null || age === undefined) return "Unknown";
  const range = AGE_RANGES.find((r) => age >= r.min && age <= r.max);
  return range ? range.label : "Unknown";
}

const heading = "Beneficiaries Reached over Time";

export default function BeneficiaryReachChart({
  reachData,
  appliedFilters,
}: BeneficiaryReachChartProps) {
  const onExport = getOnExport(BarChart);
  const [breakdownMode, setBreakdownMode] = useState<BreakdownMode>("age");
  const [metricMode, setMetricMode] = useState<MetricMode>("unique");

  const [searchParams, setSearchParams] = useSearchParams();
  const { dateFrom: from, dateTo: to } = readBeneReachFiltersFromUrl(searchParams);

  const handleFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newParams = new URLSearchParams(searchParams);
      writeBeneReachFiltersToUrl({ dateFrom: e.target.value, dateTo: to }, newParams);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams, to],
  );

  const handleToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newParams = new URLSearchParams(searchParams);
      writeBeneReachFiltersToUrl({ dateFrom: from, dateTo: e.target.value }, newParams);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams, from],
  );

  const { chartData, keys, colorMap } = useMemo(() => {
    const { ageRanges, genders, includedTags, excludedTags } = appliedFilters;

    // Build beneficiary info map from dimensions
    const beneInfoMap = new Map(
      (reachData.dimensions.beneficiary ?? []).map((b) => [
        b.id,
        { age: b.age, gender: b.gender, tagIds: b.tagIds ?? [] },
      ]),
    );

    // Apply section filters to beneficiary ids
    const filteredBeneIds = new Set<number>();
    beneInfoMap.forEach((info, id) => {
      // Age range filter
      if (ageRanges.length > 0) {
        const ageGroup = getAgeGroupLabel(info.age);
        if (!ageRanges.includes(ageGroup)) return;
      }
      // Gender filter
      if (genders.length > 0) {
        if (!genders.includes(info.gender)) return;
      }
      filteredBeneIds.add(id);
    });

    // Apply tag filter on beneficiary dimension infos
    const beneInfoList = Array.from(filteredBeneIds).map((id) => ({
      beneficiaryId: id,
      tagIds: beneInfoMap.get(id)?.tagIds ?? [],
    }));
    const tagFilteredBeneIds = new Set(
      filterByTags(beneInfoList, includedTags, excludedTags).map((b) => b.beneficiaryId),
    );

    // Filter facts to valid beneficiaries and date range
    const rangeStart = new Date(from);
    const rangeEnd = new Date(to);

    const facts = reachData.facts.filter((f) => {
      if (!tagFilteredBeneIds.has(f.beneficiaryId)) return false;
      const d = new Date(String(f.reachedOn));
      return d >= rangeStart && d <= rangeEnd;
    });

    if (facts.length === 0) {
      return { chartData: [], keys: [], colorMap: {} };
    }

    // Build list of months in range
    let months: string[];
    try {
      months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd }).map((m) =>
        format(m, "yyyy-MM"),
      );
    } catch {
      return { chartData: [], keys: [], colorMap: {} };
    }

    // Helper to get breakdown key for a beneficiary id
    const getKey = (beneficiaryId: number): string => {
      const info = beneInfoMap.get(beneficiaryId);
      if (!info) return "Unknown";
      if (breakdownMode === "age") return getAgeGroupLabel(info.age);
      return info.gender ?? "Unknown";
    };

    // Determine all keys present in data
    const allKeys = new Set<string>();
    facts.forEach((f) => allKeys.add(getKey(f.beneficiaryId)));

    const keyList =
      breakdownMode === "age"
        ? AGE_RANGES.map((r) => r.label).filter((l) => allKeys.has(l))
        : (["Male", "Female", "Diverse"] as string[]).filter((g) => allKeys.has(g));
    if (allKeys.has("Unknown")) keyList.push("Unknown");

    let monthData: BarDatum[];

    if (metricMode === "unique") {
      // For each beneficiary, find their most recent reachedOn
      // Then place them in the corresponding month
      const mostRecent = new Map<number, string>();
      facts.forEach((f) => {
        const dateStr = format(parseISO(String(f.reachedOn)), "yyyy-MM-dd");
        const prev = mostRecent.get(f.beneficiaryId);
        if (!prev || dateStr > prev) {
          mostRecent.set(f.beneficiaryId, dateStr);
        }
      });

      // Accumulate per month per breakdown key
      const acc: Record<string, Record<string, number>> = {};
      months.forEach((m) => {
        acc[m] = {};
        keyList.forEach((k) => {
          acc[m][k] = 0;
        });
      });

      mostRecent.forEach((dateStr, beneficiaryId) => {
        const month = dateStr.substring(0, 7); // "yyyy-MM"
        if (!acc[month]) return;
        const key = getKey(beneficiaryId);
        if (acc[month][key] !== undefined) {
          acc[month][key]++;
        }
      });

      monthData = months.map((m) => ({ month: m, ...acc[m] }));
    } else {
      // Total interactions: sum count per month per breakdown key
      const acc: Record<string, Record<string, number>> = {};
      months.forEach((m) => {
        acc[m] = {};
        keyList.forEach((k) => {
          acc[m][k] = 0;
        });
      });

      facts.forEach((f) => {
        const month = format(parseISO(String(f.reachedOn)), "yyyy-MM");
        if (!acc[month]) return;
        const key = getKey(f.beneficiaryId);
        if (acc[month][key] !== undefined) {
          acc[month][key] += f.count;
        }
      });

      monthData = months.map((m) => ({ month: m, ...acc[m] }));
    }

    const colorMapResult = breakdownMode === "age" ? AGE_GROUP_COLORS : GENDER_COLORS;

    return { chartData: monthData, keys: keyList, colorMap: colorMapResult };
  }, [reachData, appliedFilters, breakdownMode, metricMode, from, to]);

  const colors = useMemo(() => keys.map((k) => colorMap[k] ?? "#cccccc"), [keys, colorMap]);

  if (chartData.length === 0 || keys.length === 0) {
    return <NoDataCard header={heading} />;
  }

  const chartProps = {
    data: chartData,
    keys,
    indexBy: "month",
    width: "800px",
    height: "400px",
    colors,
    legend: true,
  };

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
        <HStack mb={4} spacing={4} flexWrap="wrap">
          <HStack spacing={2} align="center">
            <Text>
              <strong>From</strong>
            </Text>
            <Input
              type="date"
              size="md"
              value={from}
              max={to}
              onChange={handleFromChange}
              width="auto"
            />
            <Text>
              <strong>to</strong>
            </Text>
            <Input
              type="date"
              size="md"
              value={to}
              min={from}
              max={date2String(new Date())}
              onChange={handleToChange}
              width="auto"
            />
          </HStack>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button
              colorScheme={metricMode === "unique" ? "blue" : "gray"}
              variant={metricMode === "unique" ? "solid" : "outline"}
              onClick={() => setMetricMode("unique")}
            >
              Unique Beneficiaries
            </Button>
            <Button
              colorScheme={metricMode === "interactions" ? "blue" : "gray"}
              variant={metricMode === "interactions" ? "solid" : "outline"}
              onClick={() => setMetricMode("interactions")}
            >
              Total Interactions
            </Button>
          </ButtonGroup>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button
              colorScheme={breakdownMode === "age" ? "blue" : "gray"}
              variant={breakdownMode === "age" ? "solid" : "outline"}
              onClick={() => setBreakdownMode("age")}
            >
              By Age
            </Button>
            <Button
              colorScheme={breakdownMode === "gender" ? "blue" : "gray"}
              variant={breakdownMode === "gender" ? "solid" : "outline"}
              onClick={() => setBreakdownMode("gender")}
            >
              By Gender
            </Button>
          </ButtonGroup>
        </HStack>
        <BarChart {...chartProps} />
        <Wrap mt={4} spacing={4}>
          {keys.map((key) => (
            <WrapItem key={key}>
              <HStack spacing={2}>
                <Box
                  w="12px"
                  h="12px"
                  backgroundColor={colorMap[key] ?? "#cccccc"}
                  borderRadius="sm"
                />
                <Text>{key}</Text>
              </HStack>
            </WrapItem>
          ))}
        </Wrap>
      </CardBody>
    </Card>
  );
}
