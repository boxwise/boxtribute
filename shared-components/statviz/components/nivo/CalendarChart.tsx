import { ResponsiveCalendar } from "@nivo/calendar";
import { useRef, useEffect, useMemo } from "react";
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

interface LegendItem {
  color: string;
  label: string;
}

function buildLegendItems(data: { day: string; value: number }[], colors: string[]): LegendItem[] {
  if (data.length === 0 || colors.length === 0) return [];

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [{ color: colors[colors.length - 1], label: String(min) }];
  }

  const step = (max - min) / colors.length;

  return colors.map((color, i) => {
    const lo = Math.round(min + i * step);
    const hi = Math.round(min + (i + 1) * step);
    const label = i === colors.length - 1 ? `${lo}–${max}` : `${lo}–${hi - 1}`;
    return { color, label };
  });
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

  const legendItems = useMemo(
    () => buildLegendItems(chart.data, calendarColors),
    [chart.data, calendarColors],
  );

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

      {legendItems.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "center",
            padding: "8px 20px 4px",
            minWidth: 600,
          }}
        >
          {legendItems.map((item) => (
            <div key={item.color} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  flexShrink: 0,
                  backgroundColor: item.color,
                  borderRadius: 2,
                }}
              />
              <span style={{ fontSize: 12, color: "#4a5568" }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
