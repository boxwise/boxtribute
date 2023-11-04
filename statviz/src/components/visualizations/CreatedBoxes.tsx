import { ApolloError } from "@apollo/client";
import { Box, Card, CardBody } from "@chakra-ui/react";
import _ from "lodash";

import BarChart from "../nivo-graphs/BarChart";
import { useMemo } from "react";
import useCreatedBoxes from "../../hooks/useCreatedBoxes";
import { BoxesOrItemsCount } from "../../views/Dashboard/Dashboard";
import VisHeader from "../VisHeader";
import NoDataCard from "../NoDataCard";
import useExport from "../../hooks/useExport";
import { date2String } from "../../utils/chart";

const visId = "created-boxes";

export default function CreatedBoxes(params: {
  width: string;
  height: string;
  boxesOrItems: BoxesOrItemsCount;
}) {
  const { createdBoxes, loading, data, error, timerange } = useCreatedBoxes();

  const {
    exportWidth,
    exportHeight,
    isExporting,
    exportHeading,
    exportTimestamp,
    exportTimerange,
    onExport,
    onExportFinish,
  } = useExport();
  const getChartData = () => {
    if (data === undefined) return [];

    const createdBoxesPerDay = createdBoxes
      .removeMissingCreatedOn()
      .groupByCreatedOn()
      .fillMissingDays();

    return createdBoxesPerDay.data;
  };

  const createdBoxesPerDay = useMemo(getChartData, [createdBoxes, data]);

  if (error instanceof ApolloError) {
    return <p>{error.message}</p>;
  }
  if (loading) {
    return <p>loading...</p>;
  }

  const heading =
    params.boxesOrItems === "itemsCount" ? "New Items" : "Created Boxes";

  if (createdBoxesPerDay.length === 0) {
    return <NoDataCard header={heading} />;
  }

  return (
    <Card>
      <VisHeader
        maxWidthPx={params.width}
        heading={heading}
        visId={visId}
        onExport={onExport}
        onExportFinished={onExportFinish}
      ></VisHeader>
      <CardBody>
        <BarChart
          visId="preview-created-boxes"
          data={createdBoxesPerDay}
          indexBy="createdOn"
          keys={[params.boxesOrItems]}
          width={params.width}
          height={params.height}
        />
      </CardBody>
      {isExporting && (
        <Box position="absolute" top="0" left="-5000">
          <BarChart
            animate={false}
            visId={visId}
            indexBy="createdOn"
            keys={[params.boxesOrItems]}
            heading={exportHeading && heading}
            timestamp={exportTimestamp && date2String(new Date())}
            timerange={exportTimerange && timerange}
            data={createdBoxesPerDay}
            width={exportWidth + "px"}
            height={exportHeight + "px"}
          />
        </Box>
      )}
    </Card>
  );
}
