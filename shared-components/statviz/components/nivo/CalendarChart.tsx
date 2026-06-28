import { ResponsiveCalendar } from "@nivo/calendar";
import { useRef, useEffect } from "react";

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

  const calendarColors = chart.colors ?? ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"];
  const emptyColor = chart.emptyColor ?? "#eeeeee";

  return (
    <div ref={ref} style={{ width: chart.width, height: chart.height }}>
      <ResponsiveCalendar
        data={chart.data}
        from={chart.from}
        to={chart.to}
        emptyColor={emptyColor}
        colors={calendarColors}
        margin={{ top: 20, right: 20, bottom: 20, left: 40 }}
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
  );
}
