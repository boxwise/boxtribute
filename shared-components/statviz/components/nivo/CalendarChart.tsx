import { ResponsiveCalendar } from "@nivo/calendar";
import { useRef, useEffect } from "react";
import { CALENDAR_COLORS } from "../../data/colors";

export interface ICalendarChart {
  width: string;
  height: string;
  data: { day: string; value: number }[];
  from: string;
  to: string;
  emptyColor?: string;
  colors?: string[];
  rendered?: (ref: HTMLDivElement) => void;
}

export default function CalendarChart(chart: ICalendarChart) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current === null) return;
    if (!chart.rendered) return;
    chart.rendered(ref.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const calendarColors = chart.colors ?? CALENDAR_COLORS;
  const emptyColor = chart.emptyColor ?? "#eeeeee";

  return (
    <div style={{ width: chart.width, overflowX: "auto" }}>
      <div ref={ref} style={{ minWidth: 600, height: chart.height }}>
        <ResponsiveCalendar
          data={chart.data}
          from={chart.from}
          to={chart.to}
          emptyColor={emptyColor}
          colors={calendarColors}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          yearSpacing={40}
          monthBorderColor="#ffffff"
          dayBorderWidth={2}
          dayBorderColor="#ffffff"
          legends={[
            {
              anchor: "bottom-right",
              direction: "row",
              translateY: 36,
              itemCount: 4,
              itemWidth: 42,
              itemHeight: 36,
              itemsSpacing: 14,
              itemDirection: "right-to-left",
            },
          ]}
        />
      </div>
    </div>
  );
}
