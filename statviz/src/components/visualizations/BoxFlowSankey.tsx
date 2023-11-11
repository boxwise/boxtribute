import VisHeader from "../VisHeader";
import { Card, CardBody } from "@chakra-ui/react";
import SankeyChart from "../nivo-graphs/SankeyChart";
import getOnExport from "../../utils/chartExport";
import MovedBoxes from "../../views/Dashboard/MovedBoxes";
import useMovedBoxes from "../../hooks/useMovedBoxes";
import { ApolloError } from "@apollo/client";
import useCreatedBoxes from "../../hooks/useCreatedBoxes";
import { create, head } from "lodash";
import NoDataCard from "../NoDataCard";

const heading = "Moved Boxes";

export default function BoxFlowSankey(params: {
  width: string;
  height: string;
}) {
  const { movedBoxes, loading, data, error } = useMovedBoxes();

  const onExport = getOnExport(SankeyChart);

  if (error instanceof ApolloError) {
    return <p>{error.message}</p>;
  }

  if (loading) {
    return <p>loading...</p>;
  }

  const movedBoxesGrouped = movedBoxes?.groupBySum(
    "targetId",
    ["boxesCount"],
    []
  );

  if (!movedBoxesGrouped || movedBoxesGrouped.data.length === 0) {
    return <NoDataCard header={heading}></NoDataCard>;
  }
  const targetIds = movedBoxesGrouped?.data.map((e) => e.targetId);
  console.log(data.movedBoxes.dimensions.target);

  const nodes = data.movedBoxes.dimensions.target.filter(
    (target) => targetIds?.indexOf(target.id) !== -1
  );

  nodes.push({
    id: "outgoing",
    name: "outgoing",
    boxesCount: movedBoxesGrouped?.sumColumn("boxesCount"),
  });

  const chartData = {
    nodes: nodes,
    links: movedBoxesGrouped?.data.map((e) => ({
      source: "outgoing",
      target: e.targetId,
      value: e.boxesCount,
    })),
  };

  const chartProps = {
    width: params.width,
    height: params.height,
    data: chartData,
  };

  return (
    <Card>
      <VisHeader
        onExport={onExport}
        defaultHeight={500}
        defaultWidth={1000}
        heading={heading}
        chartProps={chartProps}
        maxWidthPx={1000}
        visId="bf"
      />
      <CardBody>
        <SankeyChart {...chartProps} />
      </CardBody>
    </Card>
  );
}
