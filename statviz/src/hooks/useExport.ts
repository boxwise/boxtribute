import { ImageFormat, exportChartWithSettings } from "../utils/chartExport";

export default function runExport(ChartComponent: JSX.Element) {
  const onExport = (
    width: number,
    height: number,
    heading: string | undefined,
    timerange: string | undefined,
    timestamp: string | undefined,
    chartProps: object,
    imageFormat: ImageFormat
  ) => {
    const props = {
      ...chartProps,
      width: width,
      height: height,
      timestamp: timestamp,
      timerange: timerange,
      heading: heading,
      animate: false,
    };

    exportChartWithSettings(ChartComponent, props, imageFormat);
  };

  return {
    onExport,
  };
}
