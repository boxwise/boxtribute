import { Box, Card, CardBody, Wrap, WrapItem } from "@chakra-ui/react";
import { ResultOf } from "gql.tada";
import { groupBy, innerJoin, map, sum, summarize, tidy } from "@tidyjs/tidy";
import { sample } from "lodash";
import VisHeader from "../../VisHeader";
import SankeyChart, { ISankeyData } from "../../nivo/SankeyChart";
import getOnExport from "../../../utils/chartExport";
import NoDataCard from "../../NoDataCard";
import { MovedBoxes, MovedBoxesResult } from "../../../../../graphql/types";
import { TARGET_DIMENSION_INFO_FRAGMENT } from "../../../queries/fragments";
import type { MovementDirection } from "../../../utils/dashboardFilters";
import { BoxesOrItemsCount } from "../../../utils/dashboardFilters";

// random ids, should not collide with the name of existing shipments and locations
const shipmentNode = {
  id: "shipmentsYp9WMJiNbEvi",
  name: "shipments",
  nodeColor: "#6cdb2c",
};
const selfReportedNode = {
  id: "selfreportedYp9WMJiNbEvi",
  name: "self reported",
  nodeColor: "#2c32db",
};
const outgoingNode = {
  id: "outgoingYp9WMJiNbEvi",
  name: "outgoing boxes",
  nodeColor: "#1fcc30",
};
const incomingNode = {
  id: "incomingYp9WMJiNbEvi",
  name: "incoming boxes",
  nodeColor: "#1fcc30",
};

interface IBoxFlowSankeyProps {
  width: string;
  height: string;
  data: Partial<MovedBoxes>;
  boxesOrItems: BoxesOrItemsCount;
  direction: MovementDirection;
}

export default function BoxFlowSankey({
  width,
  height,
  data,
  boxesOrItems,
  direction,
}: IBoxFlowSankeyProps) {
  const onExport = getOnExport(SankeyChart);
  const isOutgoing = direction === "out";

  const rootNode = {
    ...(isOutgoing ? outgoingNode : incomingNode),
    name:
      boxesOrItems === "boxesCount"
        ? isOutgoing
          ? "outgoing boxes"
          : "incoming boxes"
        : isOutgoing
          ? "outgoing items"
          : "incoming items",
  };
  const shipmentFlowNode = {
    ...shipmentNode,
    name: isOutgoing ? "shipments" : "received shipments",
  };
  const heading = isOutgoing ? "Outgoing Shipments Overview" : "Incoming Shipments Overview";
  const movedBoxesFacts = (data?.facts ?? []) as MovedBoxesResult[];

  const movedBoxes = tidy(
    movedBoxesFacts satisfies MovedBoxesResult[],
    groupBy(["targetId", "organisationName"], [summarize({ count: sum(boxesOrItems) })]),
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
    innerJoin(data?.dimensions?.target as ResultOf<typeof TARGET_DIMENSION_INFO_FRAGMENT>[], {
      by: { id: "targetId" },
    }),
  );
  const relevantMovedBoxes = movedBoxes.filter((movedBox) =>
    isOutgoing ? movedBox.type !== "IncomingShipment" : movedBox.type === "IncomingShipment",
  );

  if (!isOutgoing) {
    const sourceOrgNodes = tidy(
      relevantMovedBoxes,
      groupBy("organisationName", [summarize({ count: sum("count") })]),
      map((movedBox) => ({
        id: `incoming-org-${(movedBox.organisationName ?? "Unknown").replace(/\W+/g, "-")}`,
        name: movedBox.organisationName ?? "Unknown",
        nodeColor: sample(["#9467bd", "#e377c2", "#7f7f7f", "#bcbd22", "#51bd22", "#2287bd"]),
        value: movedBox.count,
      })),
    ) as Array<{ id: string; name: string; nodeColor?: string; value: number }>;

    const shipmentTotal = sourceOrgNodes.reduce((count, node) => count + node.value, 0);
    const links = [
      ...sourceOrgNodes.map((node) => ({
        source: node.id,
        target: shipmentFlowNode.id,
        value: node.value,
      })),
      ...(shipmentTotal > 0
        ? [
            {
              source: shipmentFlowNode.id,
              target: rootNode.id,
              value: shipmentTotal,
            },
          ]
        : []),
    ];
    const nodes = [rootNode, shipmentFlowNode, ...sourceOrgNodes];
    const chartData = {
      nodes,
      links,
    } as ISankeyData;

    const chartProps = {
      width,
      height,
      data: chartData,
    };

    if (chartData.nodes.length < 3 || shipmentTotal === 0) {
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
        />
        <CardBody>
          <SankeyChart {...chartProps} />
        </CardBody>
      </Card>
    );
  }

  const movedBoxesByTargetType = tidy(
    relevantMovedBoxes,
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
            source: rootNode.id,
            target: selfReportedNode.id,
            value: target.count,
            isNegative: target.isNegative,
          };
        }
        if (target.type === "OutgoingShipment") {
          return {
            source: rootNode.id,
            target: shipmentFlowNode.id,
            value: target.count,
            isNegative: target.isNegative,
          };
        }
        return undefined;
      })
      .filter((e) => e !== undefined),
    ...movedBoxes
      .filter((e) => e.type !== "IncomingShipment")
      .map((movedBox) => {
        if (movedBox.type === "OutgoingLocation") {
          return {
            source: selfReportedNode.id,
            target: movedBox.targetId,
            value: movedBox.count,
            isNegative: movedBox.isNegative,
          };
        }
        if (movedBox.type === "OutgoingShipment") {
          return {
            source: shipmentFlowNode.id,
            target: movedBox.targetId,
            value: movedBox.count,
            isNegative: movedBox.isNegative,
          };
        }
        return {
          source: rootNode.id,
          target: movedBox.targetId,
          value: movedBox.count,
          isNegative: movedBox.isNegative,
        };
      }),
  ];

  const nodes = [
    rootNode,
    ...movedBoxes
      .filter((e) => e.type !== "IncomingShipment")
      .map((movedBox) => {
        const getName = () => {
          if (movedBox.organisationName) {
            return `${movedBox.name} | ${movedBox.organisationName} `;
          }
          return movedBox.name;
        };

        return {
          id: movedBox.targetId,
          name: movedBox.isNegative ? `${getName()} removed` : getName(),
          nodeColor: movedBox.isNegative
            ? "red"
            : sample(["#9467bd", "#e377c2", "#7f7f7f", "#bcbd22", "#51bd22", "#2287bd"]),
        };
      }),
  ];

  const nodeIsTargetedByLink = (node) => links.findIndex((link) => link?.target === node.id) !== -1;

  if (nodeIsTargetedByLink(selfReportedNode)) {
    nodes.push(selfReportedNode);
  }
  if (nodeIsTargetedByLink(shipmentFlowNode)) {
    nodes.push(shipmentFlowNode);
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
      />
      <CardBody>
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
