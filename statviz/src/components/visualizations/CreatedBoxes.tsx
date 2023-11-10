import { ApolloError } from "@apollo/client";
import { Card, CardBody } from "@chakra-ui/react";
import _ from "lodash";

import BarChart from "../nivo-graphs/BarChart";
import { useMemo } from "react";
import useCreatedBoxes from "../../hooks/useCreatedBoxes";
import { BoxesOrItemsCount } from "../../views/Dashboard/Dashboard";
import VisHeader from "../VisHeader";
import NoDataCard from "../NoDataCard";
import getOnExport from "../../utils/chartExport";

const visId = "created-boxes";

export default function CreatedBoxes(params: {
  width: string;
  height: string;
  boxesOrItems: BoxesOrItemsCount;
}) {
  const { createdBoxes, loading, data, error } = useCreatedBoxes();

  const onExport = getOnExport(BarChart);
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

  const chartProps = {
    visId: "preview-created-boxes",
    data: createdBoxesPerDay,
    indexBy: "createdOn",
    keys: [params.boxesOrItems],
    width: params.width,
    height: params.height,
  };

  return (
    <Card>
      <VisHeader
        maxWidthPx={params.width}
        heading={heading}
        visId={visId}
        onExport={onExport}
        defaultHeight={500}
        defaultWidth={1000}
        chartProps={chartProps}
      ></VisHeader>
      <CardBody>
        <BarChart {...chartProps} />
      </CardBody>
    </Card>
  );
}
