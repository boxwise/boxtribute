import { Card, CardBody } from "@chakra-ui/react";
import { useMemo } from "react";
import { groupBy, sum, summarize, tidy, map } from "@tidyjs/tidy";
import { format, subYears, parseISO } from "date-fns";
import { CreatedBoxes as CreatedBoxesType, CreatedBoxesResult } from "../../../../../graphql/types";
import { BoxesOrItemsCount } from "../../../dashboard/ItemsAndBoxes";
import CalendarChart from "../../nivo/CalendarChart";
import VisHeader from "../../VisHeader";
import NoDataCard from "../../NoDataCard";
import getOnExport from "../../../utils/chartExport";

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

  const now = new Date();
  const fromDate = subYears(now, 1);
  const from = format(fromDate, "yyyy-MM-dd");
  const to = format(now, "yyyy-MM-dd");

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
        maxWidthPx={width}
        heading={heading}
        onExport={onExport}
        defaultHeight={200}
        defaultWidth={900}
        chartProps={chartProps}
      />
      <CardBody>
        <CalendarChart {...chartProps} />
      </CardBody>
    </Card>
  );
}
