import domtoimage from "dom-to-image-more";
import { render } from "react-dom";
import { createRoot } from "react-dom/client";
import { isChartExporting } from "../state/exportingCharts";

const createOffScreenContainer = () => {
  const offScreenContainer = document.createElement("div");
  offScreenContainer.style.position = "absolute";
  offScreenContainer.style.left = "-9999px";
  offScreenContainer.style.top = "-9999px";
  return offScreenContainer;
};

export type ImageFormat = "svg" | "png" | "jpg";

const exportChartWithSettings = (
  ChartComponent: JSX.Element,
  chartProps: object,
  exportFormat: ImageFormat
) => {
  const exportContainer = createOffScreenContainer();

  const rendered = () => {
    const downloadImage = (dataUrl: string) => {
      link.download = `chart.${exportFormat}`;
      link.href = dataUrl;
      link.click();

      document.body.removeChild(link);
      document.body.removeChild(exportContainer);
      isChartExporting(false);
    };

    const handleError = () => {
      console.log("something went wrong");
      document.body.removeChild(link);
      document.body.removeChild(exportContainer);
      isChartExporting(false);
    };

    const defaultImageOptions = {
      copyDefaultStyles: false,
      width: chartProps.width,
      height: chartProps.height,
      quality: 0.9,
    };

    const exportImage = () => {
      if (exportFormat === "svg") {
        domtoimage
          .toSvg(exportContainer, defaultImageOptions)
          .then(downloadImage)
          .catch(handleError);
      }
      if (exportFormat === "jpg") {
        domtoimage
          .toJpeg(exportContainer, defaultImageOptions)
          .then(downloadImage)
          .catch(handleError);
      }
      if (exportFormat === "png") {
        domtoimage
          .toPng(exportContainer, defaultImageOptions)
          .then(downloadImage)
          .catch(handleError);
      }
    };

    // exportImage();
    setTimeout(exportImage, 1);
  };

  const root = createRoot(exportContainer);
  root.render(<ChartComponent {...chartProps} rendered={rendered} />);

  document.body.appendChild(exportContainer);
  const link = document.createElement("a");
  document.body.appendChild(link);
};

export default function getOnExport(ChartComponent: JSX.Element) {
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
      width,
      height,
      timestamp,
      timerange,
      heading,
      animate: false,
    };

    exportChartWithSettings(ChartComponent, props, imageFormat);
  };

  return onExport;
}
