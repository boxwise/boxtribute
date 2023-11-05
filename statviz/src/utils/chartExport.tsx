import { ReactDOM, useEffect } from "react";
import domtoimage from "dom-to-image-more";
import BarChart from "../components/nivo-graphs/BarChart";
import { createRoot } from "react-dom/client";
const createOffScreenContainer = () => {
  const offScreenContainer = document.createElement("div");
  offScreenContainer.style.position = "absolute";
  offScreenContainer.style.left = "-9999px";
  offScreenContainer.style.top = "-9999px";
  return offScreenContainer;
};

export const exportChartWithSettings = (ChartComponent, chartProps) => {
  const exportContainer = createOffScreenContainer();

  const root = createRoot(exportContainer);
  root.render(<BarChart {...chartProps} />);

  document.body.appendChild(exportContainer);
  const link = document.createElement("a");
  document.body.appendChild(link);

  const exportImage = () => {
    domtoimage
      .toPng(exportContainer)
      .then((dataUrl) => {
        link.download = "chart.png";
        link.href = dataUrl;
        link.click();

        document.body.removeChild(link);
        document.body.removeChild(exportContainer);
        root.unmount();
      })
      .catch(() => {
        console.log("something went wrong");
        document.body.removeChild(link);
        document.body.removeChild(exportContainer);
        root.unmount();
      });
  };

  setTimeout(exportImage, 500);
};
