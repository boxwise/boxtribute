import { ApolloError } from "@apollo/client";
import { Card, CardBody } from "@chakra-ui/react";
import _ from "lodash";

import BarChart from "../nivo-graphs/BarChart";
import { useMemo } from "react";
import useCreatedBoxes from "../../hooks/useCreatedBoxes";
import { BoxesOrItemsCount } from "../../views/Dashboard/Dashboard";
import VisHeader from "../VisHeader";
import NoDataCard from "../NoDataCard";
import useExport from "../../hooks/useExport";

const visId = "created-boxes";

export default function CreatedBoxes(params: {
  width: string;
  height: string;
  boxesOrItems: BoxesOrItemsCount;
}) {
  const { createdBoxes, loading, data, error } = useCreatedBoxes();

  const { exportWidth, exportHeight, isExporting, onExport, onExportFinish } =
    useExport();

  const getChartData = () => {
    if (data === undefined) return [];

    const createdBoxesPerDay = createdBoxes
      .removeMissingCreatedOn()
      .groupByCreatedOn()
      .fillMissingDays();

    return createdBoxesPerDay.data;
  };

  const createdBoxesPerDay = useMemo(getChartData, [createdBoxes]);

  if (error instanceof ApolloError) {
    return <p>{error.message}</p>;
  }
  if (loading) {
    return <p>loading...</p>;
  }

  const getHeading = () =>
    params.boxesOrItems === "itemsCount" ? "New Items" : "Created Boxes";

  if (createdBoxesPerDay.length === 0) {
    return <NoDataCard header={getHeading()} />;
  }

  return (
    <Card>
      <VisHeader
        maxWidthPx={params.width}
        heading={getHeading()}
        visId={visId}
      ></VisHeader>
      <CardBody>
        <BarChart
          visId={visId}
          data={createdBoxesPerDay}
          indexBy="createdOn"
          keys={[params.boxesOrItems]}
          width={params.width}
          height={params.height}
        />
      </CardBody>
      {isExporting && (
        <BarChart
          animate={false}
          visId={visId}
          data={createdBoxesPerDay}
          indexBy="createdOn"
          keys={[params.boxesOrItems]}
          width={params.width}
          height={params.height}
        />
      )}
    </Card>
  );
}
