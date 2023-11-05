import { useState } from "react";
import { exportChartWithSettings } from "../utils/chartExport";
import { date2String } from "../utils/chart";

export default function useExport(ChartComponent) {
  const [isExporting, setIsExporting] = useState(false);

  const onExport = (
    width: number,
    height: number,
    exportHeading: boolean,
    exportTimerange: boolean,
    exportTimestamp: boolean,
    chartProps: object
  ) => {
    setIsExporting(true);

    const props = {
      ...chartProps,
      width: width,
      height: height,
      timestamp: exportTimestamp ? date2String(new Date()) : undefined,
      timerange: exportTimerange ? "timerange" : undefined,
      heading: exportHeading ? "heading" : undefined,
    };

    exportChartWithSettings(ChartComponent, props);
    setIsExporting(false);
  };

  return {
    isExporting,
    onExport,
  };
}
