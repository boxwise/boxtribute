import { Card, CardBody, HStack, Input, Text } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { groupBy, sum, summarize, tidy, map } from "@tidyjs/tidy";
import { format, parseISO } from "date-fns";
import { CreatedBoxes as CreatedBoxesType, CreatedBoxesResult } from "../../../../../graphql/types";
import { BoxesOrItemsCount } from "../../../dashboard/ItemsAndBoxes";
import CalendarChart from "../../nivo/CalendarChart";
import VisHeader from "../../VisHeader";
import NoDataCard from "../../NoDataCard";
import getOnExport from "../../../utils/chartExport";
import {
  readCalendarFiltersFromUrl,
  writeCalendarFiltersToUrl,
} from "../../../utils/dashboardFilters";
import { date2String } from "../../../../utils/helpers";

interface BoxCreationCalendarProps {
  width: string;
  height: string;
  data: Partial<CreatedBoxesType>;
  boxesOrItems: BoxesOrItemsCount;
}

export default function BoxCreationCalendar({
  width,
  height,
  data,
  boxesOrItems,
}: BoxCreationCalendarProps) {
  const onExport = getOnExport(CalendarChart);

  const [searchParams, setSearchParams] = useSearchParams();
  const { dateFrom: from, dateTo: to } = readCalendarFiltersFromUrl(searchParams);

  const handleFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newParams = new URLSearchParams(searchParams);
      writeCalendarFiltersToUrl({ dateFrom: e.target.value, dateTo: to }, newParams);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams, to],
  );

  const handleToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newParams = new URLSearchParams(searchParams);
      writeCalendarFiltersToUrl({ dateFrom: from, dateTo: e.target.value }, newParams);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams, from],
  );

  const calendarData = useMemo(() => {
    const facts = (data?.facts as CreatedBoxesResult[]) ?? [];

    return tidy(
      facts.filter((f) => f.createdOn !== null),
      map((row) => ({
        ...row,
        createdOn: format(parseISO(String(row.createdOn)), "yyyy-MM-dd"),
      })),
      groupBy("createdOn", summarize({ value: sum(boxesOrItems) })),
      map((row) => ({
        day: row.createdOn as string,
        value: (row.value as number) ?? 0,
      })),
    ) as { day: string; value: number }[];
  }, [data, boxesOrItems]);

  const heading = "Box Creation over Time";

  if (calendarData.length === 0) {
    return <NoDataCard header={heading} />;
  }

  const chartProps = {
    data: calendarData,
    from,
    to,
    width,
    height,
  };

  return (
    <Card>
      <VisHeader
        heading={heading}
        onExport={onExport}
        defaultHeight={200}
        defaultWidth={900}
        chartProps={chartProps}
      />
      <CardBody>
        <HStack mb={4} spacing={2} align="center">
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
        <CalendarChart {...chartProps} />
      </CardBody>
    </Card>
  );
}
