import { Card, CardBody } from "@chakra-ui/react";
import { filter, groupBy, innerJoin, sum, summarize, tidy } from "@tidyjs/tidy";
import VisHeader from "../../VisHeader";
import SankeyChart, { ISankeyData } from "../../nivo/SankeyChart";
import getOnExport from "../../../utils/chartExport";
import {
  MovedBoxesData,
  MovedBoxesResult,
  TargetDimensionInfo,
} from "../../../../types/generated/graphql";
import { BoxesOrItemsCount } from "../../../dashboard/ItemsAndBoxes";

// random ids, should not collide with the name of existing shipments and locations
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

interface IBoxFlowSankeyProps {
  width: string;
  height: string;
  data: MovedBoxesData;
  boxesOrItems: BoxesOrItemsCount;
}

export default function BoxFlowSankey({ width, height, data, boxesOrItems }: IBoxFlowSankeyProps) {
  const onExport = getOnExport(SankeyChart);

  const heading = boxesOrItems === "boxesCount" ? "shipped boxes" : "shipped items";
  const movedBoxesFacts = data.facts as MovedBoxesResult[];

  const movedBoxes = tidy(
    movedBoxesFacts,
    groupBy("targetId", [summarize({ count: sum(boxesOrItems) })]),
    filter((item) => item.count > 0),
    innerJoin(data.dimensions?.target as TargetDimensionInfo[], {
      by: { id: "targetId" },
    }),
  );

  const movedBoxesByTargetType = tidy(
    movedBoxes,
    groupBy("type", [summarize({ count: sum("count") })]),
  );

  const links = [
    ...movedBoxesByTargetType
      .map((target) => {
        if (target.type === "OutgoingLocation") {
          return {
            source: outgoingNode.id,
            target: selfReportedNode.id,
            value: target.count,
          };
        }
        if (target.type === "Shipment") {
          return {
            source: outgoingNode.id,
            target: shipmentNode.id,
            value: target.count,
          };
        }
        return undefined;
      })
      .filter((e) => e !== undefined),
    ...movedBoxes.map((movedBox) => {
      if (movedBox.type === "OutgoingLocation") {
        return {
          source: selfReportedNode.id,
          target: movedBox.targetId,
          value: movedBox.count,
        };
      }
      if (movedBox.type === "Shipment") {
        return {
          source: shipmentNode.id,
          target: movedBox.targetId,
          value: movedBox.count,
        };
      }
      return {
        source: outgoingNode.id,
        target: movedBox.targetId,
        value: movedBox.count,
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

  const nodeIsTargetedByLink = (node) => links.findIndex((link) => link?.target === node.id) !== -1;

  if (nodeIsTargetedByLink(selfReportedNode)) {
    nodes.push(selfReportedNode);
  }
  if (nodeIsTargetedByLink(shipmentNode)) {
    nodes.push(shipmentNode);
  }

  const chartData = {
    nodes,
    links,
  } as ISankeyData;

  const chartProps = {
    width,
    height,
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
