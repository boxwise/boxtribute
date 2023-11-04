import { useState } from "react";

export default function useExport() {
  const [exportWidth, setExportWidth] = useState(0);
  const [exportHeight, setExportHeight] = useState(0);
  const [exportHeading, setExportHeading] = useState(false);
  const [exportTimestamp, setExportTimestamp] = useState(false);
  const [exportTimerange, setExportTimerange] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const onExport = (
    width: number,
    height: number,
    exportHeading: boolean,
    exportTimerange: boolean,
    exportTimestamp: boolean
  ) => {
    setExportHeading(exportHeading);
    setExportTimestamp(exportTimestamp);
    setExportTimerange(exportTimerange);
    setExportWidth(width);
    setExportHeight(height);
    setIsExporting(true);
  };

  const onExportFinish = () => {
    setIsExporting(false);
  };

  return {
    exportWidth,
    exportHeight,
    exportHeading,
    exportTimestamp,
    exportTimerange,
    isExporting,
    onExport,
    onExportFinish,
  };
}
