import { useState } from "react";
import { Heading } from "@chakra-ui/react";
import BarChartCenterAxis from "../../../components/custom-graphs/BarChartCenterAxis";
import { range } from "lodash";
import { HumanGender } from "../../../types/generated/graphql";

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

export default function DemographicChart(props: { cube: IDemographicCube }) {
  const facts = [...props.cube.facts];

  const prepareFacts = (facts: IDemographicFact[]) => {
    const dataXr = facts
      .filter((value) => value.gender === HumanGender.Male)
      .map((e) => ({ x: e.count, y: e.age }));

    const dataXl = facts
      .filter((value) => value.gender === HumanGender.Female)
      .map((e) => ({ x: e.count, y: e.age }));

    return [dataXr, dataXl];
  };

  const [a, b] = prepareFacts(facts);

  const [dataXr, SetDataXr] = useState(a);
  const [dataXl, SetDataXl] = useState(b);

  const maxAge: number = facts.reduce((acc: number, current) => {
    if (current.age > acc) return current.age;
    return acc;
  }, 0);

  const height = 400;
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
    settings: {
      hideZeroY: false,
    },
  };

  const onFilterChange = (facts: IDemographicFact[]) => {
    const [a, b] = prepareFacts(facts);
    SetDataXr(a);
    SetDataXl(b);
  };

  return (
    <>
      <Heading size="md">Demographic Chart</Heading>
      <div
        id="chart-container"
        style={{ width: "100%", height: "100%", marginTop: "25px" }}
      >
        <BarChartCenterAxis fields={chart} />
      </div>
    </>
  );
}
