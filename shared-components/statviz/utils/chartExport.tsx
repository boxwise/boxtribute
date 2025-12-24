import domtoimage from "dom-to-image-more";
import { createRoot } from "react-dom/client";
import { JSX } from "react";
import { isChartExporting } from "../state/exportingCharts";

const createOffScreenContainer = () => {
  const offScreenContainer = document.createElement("div");
  offScreenContainer.style.fontSize = "50px";
  offScreenContainer.style.position = "absolute";
  offScreenContainer.style.left = "-9999px";
  offScreenContainer.style.top = "-9999px";
  return offScreenContainer;
};

export type ImageFormat = "svg" | "png" | "jpg";

export interface IExportableChartProps {
  width: string | number;
  height: string | number;
  rendered?: (ref: HTMLDivElement) => void;
  animate?: boolean;
  timestamp?: string;
  timerange?: string;
  heading?: string;
}

const exportChartWithSettings = <T,>(
  ChartComponent: (props: T) => JSX.Element,
  chartProps: T,
  exportFormat: ImageFormat,
) => {
  const exportContainer = createOffScreenContainer();
  const link = document.createElement("a");

  const rendered = (ref: HTMLDivElement) => {
    const downloadImage = (dataUrl: string) => {
      link.download = `chart.${exportFormat}`;
      link.href = dataUrl;
      link.click();

      document.body.removeChild(link);
      document.body.removeChild(exportContainer);
      isChartExporting(false);
    };

    const handleError = () => {
      document.body.removeChild(link);
      document.body.removeChild(exportContainer);
      isChartExporting(false);
    };

    const defaultImageOptions = {
      copyDefaultStyles: false,
      width:
        typeof (chartProps as IExportableChartProps).width === "string"
          ? (chartProps as IExportableChartProps).width
          : `${(chartProps as IExportableChartProps).width}px`,
      height:
        typeof (chartProps as IExportableChartProps).height === "string"
          ? (chartProps as IExportableChartProps).height
          : `${(chartProps as IExportableChartProps).height}px`,
      quality: 0.9,
    };

    const exportImage = () => {
      if (exportFormat === "svg") {
        domtoimage.toSvg(ref, defaultImageOptions).then(downloadImage).catch(handleError);
      }
      if (exportFormat === "jpg") {
        domtoimage.toJpeg(ref, defaultImageOptions).then(downloadImage).catch(handleError);
      }
      if (exportFormat === "png") {
        domtoimage.toPng(ref, defaultImageOptions).then(downloadImage).catch(handleError);
      }
    };

    // increase to 250ms to see if it fixes download issues in safari.
    // a better solution must be researched
    setTimeout(exportImage, 250);
  };

  const root = createRoot(exportContainer);
  root.render(<ChartComponent {...chartProps} rendered={rendered} />);

  document.body.appendChild(exportContainer);
  document.body.appendChild(link);
};

export default function getOnExport<T>(ChartComponent: (props: T) => JSX.Element) {
  const onExport = (
    width: string | number,
    height: string | number,
    heading: string | undefined,
    timerange: string | undefined,
    timestamp: string | undefined,
    chartProps: Partial<T>,
    imageFormat: ImageFormat,
  ) => {
    const props = {
      ...chartProps,
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height,
      timestamp,
      timerange,
      heading,
      animate: false,
    } as T;

    exportChartWithSettings(ChartComponent, props, imageFormat);
  };

  return onExport;
}
