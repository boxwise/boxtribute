import { useState } from "react";
import { Heading } from "@chakra-ui/react";
import BarChartCenterAxis from "../../../components/graphs/BarChartCenterAxis";
import { range } from "lodash";
import FilterCreatedOn from "./filter/FilterCreatedOn";
import { HumanGender } from "../../../types/generated/graphql";
import FilterTag from "./filter/FilterTag";

export interface IDemographicFact {
  createdOn: Date;
  age: number;
  count: number;
  gender: string;
  tags: number[];
}

export interface ITag {
  id: string,
  name: string
}

export interface IDemographicCube {
  facts: IDemographicFact[];
  dimensions: {
    tag: ITag[]
  }
}

export default function DemographicChart(props: { cube: IDemographicCube }) {
  const facts = [ ...props.cube.facts ]

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

  const height = 500;
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
      <Heading>Demographic Chart</Heading>
      <FilterCreatedOn onSubmit={onFilterChange} facts={facts} />
      <FilterTag onSubmit={onFilterChange} facts={facts} dim={props.cube.dimensions} />
      <div id="chart-container" style={{ marginTop: "20px", width: "100%", height: "100%" }}>
        <BarChartCenterAxis fields={chart} />
      </div>
    </>
  );
}
