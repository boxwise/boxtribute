import { Box, Card, CardBody, Wrap, WrapItem } from "@chakra-ui/react";
import { groupBy, innerJoin, map, sum, summarize, tidy } from "@tidyjs/tidy";
import { sample } from "lodash";
import VisHeader from "../../VisHeader";
import SankeyChart, { ISankeyData } from "../../nivo/SankeyChart";
import getOnExport from "../../../utils/chartExport";
import {
  MovedBoxesData,
  MovedBoxesResult,
  TargetDimensionInfo,
} from "../../../../types/generated/graphql";
import { BoxesOrItemsCount } from "../../../dashboard/ItemsAndBoxes";
import NoDataCard from "../../NoDataCard";
import Targetfilter from "../../filter/LocationFilter";

// random ids, should not collide with the name of existing shipments and locations
const shipmentNode = {
  id: "shipmentsYp9WMJiNbEvi",
  name: "shipments",
  nodeColor: "#2c4fdb",
};
const selfReportedNode = {
  id: "selfreportedYp9WMJiNbEvi",
  name: "self reported",
  nodeColor: "#db662c",
};
const outgoingNode = {
  id: "outgoingYp9WMJiNbEvi",
  name: "outgoing boxes",
  nodeColor: "#1fcc30",
};

interface IBoxFlowSankeyProps {
  width: string;
  height: string;
  data: MovedBoxesData;
  boxesOrItems: BoxesOrItemsCount;
}

export default function BoxFlowSankey({ width, height, data, boxesOrItems }: IBoxFlowSankeyProps) {
  const onExport = getOnExport(SankeyChart);

  const heading = boxesOrItems === "boxesCount" ? "outgoing boxes" : "outgoing items";
  const movedBoxesFacts = data.facts as MovedBoxesResult[];

  const movedBoxes = tidy(
    movedBoxesFacts,
    groupBy("targetId", [summarize({ count: sum(boxesOrItems) })]),
    map((item) => {
      if (item.count < 0) {
        return {
          ...item,
          count: Math.abs(item.count),
          isNegative: true,
        };
      }
      return {
        ...item,
        isNegative: false,
      };
    }),
    innerJoin(data.dimensions?.target as TargetDimensionInfo[], {
      by: { id: "targetId" },
    }),
  );

  const movedBoxesByTargetType = tidy(
    movedBoxes,
    groupBy("type", [summarize({ count: sum("count") })]),
    map((movedBox) => {
      if (movedBox.count < 0) {
        return {
          ...movedBox,
          count: Math.abs(movedBox.count),
          isNegative: true,
        };
      }
      return { ...movedBox, isNegative: false };
    }),
  );

  const links = [
    ...movedBoxesByTargetType
      .map((target) => {
        if (target.type === "OutgoingLocation") {
          return {
            source: outgoingNode.id,
            target: selfReportedNode.id,
            value: target.count,
            isNegative: target.isNegative,
          };
        }
        if (target.type === "Shipment") {
          return {
            source: outgoingNode.id,
            target: shipmentNode.id,
            value: target.count,
            isNegative: target.isNegative,
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
          isNegative: movedBox.isNegative,
        };
      }
      if (movedBox.type === "Shipment") {
        return {
          source: shipmentNode.id,
          target: movedBox.targetId,
          value: movedBox.count,
          isNegative: movedBox.isNegative,
        };
      }
      return {
        source: outgoingNode.id,
        target: movedBox.targetId,
        value: movedBox.count,
        isNegative: movedBox.isNegative,
      };
    }),
  ];

  const nodes = [
    outgoingNode,
    ...movedBoxes.map((movedBox) => ({
      id: movedBox.targetId,
      name: movedBox.isNegative ? `${movedBox.name} removed` : movedBox.name,
      nodeColor: movedBox.isNegative
        ? "red"
        : sample(["#9467bd", "#e377c2", "#7f7f7f", "#bcbd22", "#22bd5b", "#51bd22", "#2287bd"]),
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

  if (chartData.nodes.length < 2) {
    return <NoDataCard header={heading} />;
  }

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
        <Wrap>
          <WrapItem>
            <Targetfilter />
          </WrapItem>
        </Wrap>
        <SankeyChart {...chartProps} />
        <Wrap align="center">
          <WrapItem>
            <Box w="15px" h="15px" backgroundColor="red" />
          </WrapItem>
          <WrapItem color="red">
            Red targets indicate an incoming/reverse flow, i.e. a removal of items/boxes from that
            location to instock storage.
          </WrapItem>
        </Wrap>
      </CardBody>
    </Card>
  );
}
