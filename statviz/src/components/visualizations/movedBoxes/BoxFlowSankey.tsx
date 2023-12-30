import { Card, CardBody } from "@chakra-ui/react";
import { ApolloError } from "@apollo/client";
import { groupBy, innerJoin, sum, summarize, tidy, filter } from "@tidyjs/tidy";
import VisHeader from "../../VisHeader";
import SankeyChart from "../../nivo-graphs/SankeyChart";
import getOnExport from "../../../utils/chartExport";
import useMovedBoxes from "../../../hooks/useMovedBoxes";
import NoDataCard from "../../NoDataCard";
import {
  MovedBoxesData,
  TargetDimensionInfo,
} from "../../../types/generated/graphql";

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

export default function BoxFlowSankey(props: {
  width: string;
  height: string;
  movedBoxes: MovedBoxesData;
}) {
  const onExport = getOnExport(SankeyChart);

  const movedBoxes = tidy(
    props.movedBoxes.facts,
    groupBy("targetId", [summarize({ boxesCount: sum("boxesCount") })]),
    innerJoin(props.movedBoxes.dimensions.target as TargetDimensionInfo[], {
      by: { id: "targetId" },
    })
  );

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
    nodes,
    links,
  };

  const chartProps = {
    width: props.width,
    height: props.height,
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
