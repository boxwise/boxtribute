import { Card, CardBody, Heading } from "@chakra-ui/react";
import BarChartCenterAxis from "../../../components/custom-graphs/BarChartCenterAxis";
import { range } from "lodash";
import { HumanGender } from "../../../types/generated/graphql";
import { getSelectionBackground } from "../../../utils/theme";
import { useState } from "react";
import VisHeader from "./VisHeader";

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
  const [selected, setSelected] = useState<boolean>(false);
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
    settings: {
      hideZeroY: false,
    },
  };

  return (
    <Card backgroundColor={getSelectionBackground(selected)}>
      <VisHeader
        heading="Demographics"
        visId="dc"
        onSelect={() => setSelected(true)}
        onDeselect={() => setSelected(false)}
      ></VisHeader>
      <CardBody id="chart-container" style={{ width: "100%", height: "100%" }}>
        <BarChartCenterAxis fields={chart} />
      </CardBody>
    </Card>
  );
}
