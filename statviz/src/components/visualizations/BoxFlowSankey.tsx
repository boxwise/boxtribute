import VisHeader from "../VisHeader";
import { Card, CardBody } from "@chakra-ui/react";
import SankeyChart from "../nivo-graphs/SankeyChart";
import getOnExport from "../../utils/chartExport";
import useMovedBoxes from "../../hooks/useMovedBoxes";
import { ApolloError } from "@apollo/client";
import NoDataCard from "../NoDataCard";
import { TargetDimensionInfo } from "../../types/generated/graphql";
import { groupBy, innerJoin, sum, summarize, tidy, filter } from "@tidyjs/tidy";

const heading = "Moved Boxes";

const shipmentNode = {
  id: "shipmentsYp9WMJiNbEvi",
  name: "shipments",
};
const selfReportedNode = {
  id: "selfreportedYp9WMJiNbEvi",
  name: "self reported",
};
const outgoingNode = {
  id: "outgoingYp9WMJiNbEvi",
  name: "outgoing boxes",
};

export default function BoxFlowSankey(params: {
  width: string;
  height: string;
  filter?: {
    locations: string[];
  };
}) {
  const { loading, data, error, movedBoxesFacts } = useMovedBoxes();

  const onExport = getOnExport(SankeyChart);

  if (error instanceof ApolloError) {
    return <p>{error.message}</p>;
  }

  if (loading) {
    return <p>loading...</p>;
  }

  const movedBoxes = tidy(
    movedBoxesFacts,
    groupBy("targetId", [summarize({ boxesCount: sum("boxesCount") })]),
    innerJoin(data.movedBoxes.dimensions.target as TargetDimensionInfo[], {
      by: { id: "targetId" },
    }),
    filter(
      (movedBox) =>
        params.filter?.locations.findIndex(
          (location) => movedBox.targetId === location
        ) === -1
    )
  );

  if (!movedBoxes || movedBoxesFacts.length === 0) {
    return <NoDataCard header={heading}></NoDataCard>;
  }

  const movedBoxesByTargetType = tidy(
    movedBoxes,
    groupBy("type", [summarize({ boxesCount: sum("boxesCount") })])
  );

  const links = [
    ...movedBoxesByTargetType
      .map((target) => {
        if (target.type === "OutgoingLocation") {
          return {
            source: outgoingNode.id,
            target: selfReportedNode.id,
            value: target.boxesCount,
          };
        }
        if (target.type === "Shipment") {
          return {
            source: outgoingNode.id,
            target: shipmentNode.id,
            value: target.boxesCount,
          };
        }
      })
      .filter((e) => e !== undefined),
    ...movedBoxes.map((movedBox) => {
      if (movedBox.type === "OutgoingLocation") {
        return {
          source: selfReportedNode.id,
          target: movedBox.targetId,
          value: movedBox.boxesCount,
        };
      }
      if (movedBox.type === "Shipment") {
        return {
          source: shipmentNode.id,
          target: movedBox.targetId,
          value: movedBox.boxesCount,
        };
      }
      return {
        source: outgoingNode.id,
        target: movedBox.targetId,
        value: movedBox.boxesCount,
      };
    }),
  ];
  const nodes = [
    outgoingNode,
    ...movedBoxes.map((movedBox) => ({
      id: movedBox.targetId,
      name: movedBox.name,
    })),
  ];

  const nodeIsTargetedByLink = (node) =>
    links.findIndex((link) => link?.target === node.id) !== -1;
  if (nodeIsTargetedByLink(selfReportedNode)) {
    nodes.push(selfReportedNode);
  }
  if (nodeIsTargetedByLink(shipmentNode)) {
    nodes.push(shipmentNode);
  }

  const chartData = {
    nodes: nodes,
    links,
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
