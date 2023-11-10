import VisHeader from "../VisHeader";
import { Card, CardBody } from "@chakra-ui/react";
import SankeyChart from "../nivo-graphs/SankeyChart";
import getOnExport from "../../utils/chartExport";
import MovedBoxes from "../../views/Dashboard/MovedBoxes";
import useMovedBoxes from "../../hooks/useMovedBoxes";
import { ApolloError } from "@apollo/client";

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

  const test = movedBoxes?.groupBySum("targetId", ["boxesCount"], []);
  const targetIds = test?.data.map((e) => e.targetId);
  console.log(data.movedBoxes.dimensions.target);

  const targets = data.movedBoxes.dimensions.target.filter(
    (target) => targetIds?.indexOf(target.id) !== -1
  );
  targets.push({
    id: "warehouse#source",
    name: "Warehouse",
    boxesCount: test?.sumColumn("boxesCount"),
  });

  const chartData = {
    nodes: targets,
    links: test?.data.map((e) => ({
      source: "warehouse#source",
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
        heading={MovedBoxes}
        onExport={onExport}
        defaultHeight={500}
        defaultWidth={1000}
        heading={heading}
        maxWidthPx={1000}
        visId="bf"
      />
      <CardBody>
        <SankeyChart {...chartProps} />
      </CardBody>
    </Card>
  );
}
