import { Card, CardBody, CardHeader, Heading } from "@chakra-ui/react";
import BarChartCenterAxis from "../custom-graphs/BarChartCenterAxis";
import { range } from "lodash";
import { HumanGender } from "../../types/generated/graphql";
import { getSelectionBackground } from "../../utils/theme";
import { useState } from "react";
import VisHeader from "../VisHeader";
import { table } from "../../utils/table";

export interface IDemographicFact {
  createdOn: Date;
  age: number;
  count: number;
  gender: string;
}

export interface ITag {
  id: string;
  name: string;
}

export interface IDemographicCube {
  facts: IDemographicFact[];
  dimensions: {
    tag: ITag[];
  };
}

const visId = "demographic-pyramid";

export default function DemographicChart(props: {
  cube: IDemographicCube;
  width: number;
  height: number;
}) {
  const facts = [...props.cube.facts];

  if (facts.length === 0) {
    return (
      <Card w={props.width}>
        <CardHeader>
          <Heading size="md">Created Boxes</Heading>
        </CardHeader>
        <CardBody>
          <p>
            No demographic data available for your base. Either you are a
            sending base which is not registering people or the birth date is
            not registered.
          </p>
        </CardBody>
      </Card>
    );
  }

  const prepareFacts = (facts: IDemographicFact[]) => {
    const dataXr = table(
      facts
        .filter((value) => value.gender === HumanGender.Male)
        .map((e) => ({ x: e.count, y: e.age }))
    ).groupBySum("y", ["x"]).data;

    const dataXl = table(
      facts
        .filter((value) => value.gender === HumanGender.Female)
        .map((e) => ({ x: e.count, y: e.age }))
    ).groupBySum("y", ["x"]).data;

    return [dataXr, dataXl];
  };

  const [dataXr, dataXl] = prepareFacts(facts);

  const maxAge: number = facts.reduce((acc: number, current) => {
    if (current.age > acc) return current.age;
    return acc;
  }, 0);

  const height = 650;
  const width = 700;

  const chart = {
    labelY: "Age",
    labelXr: "Male",
    labelXl: "Female",
    dataY: range(-1, maxAge + 2),
    dataXr,
    dataXl,
    width,
    height,
    background: "#ffffff",
    colorBarLeft: "#ec5063",
    colorBarRight: "#31cab5",
    visId: visId,
    settings: {
      hideZeroY: false,
    },
  };

  return (
    <Card>
      <VisHeader
        maxWidthPx={width}
        heading="Demographics"
        visId={visId}
        custom={true}
      ></VisHeader>
      <CardBody id="chart-container" style={{ width: "100%", height: "100%" }}>
        <BarChartCenterAxis fields={chart} />
      </CardBody>
    </Card>
  );
}
