import { useState } from "react";
import { Heading } from "@chakra-ui/react";
import BarChartCenterAxis from "components/graphs/BarChartCenterAxis";
import { range } from "lodash";
import { HumanGender } from "types/generated/graphql";
import { beneficiaryDemographicsMock } from "mocks/demographic";
import FilterCreatedOn from "./filter/FilterCreatedOn";

interface IDemographicFact {
  createdOn: Date;
  age: number;
  count: number;
  gender: string;
}

export default function DemographicChart() {
  const getFacts = (): IDemographicFact[] => {
    const dataRaw = [...beneficiaryDemographicsMock.data.beneficiaryDemographics];

    return dataRaw.map((e) => ({
      ...e,
      createdOn: new Date(e.createdOn),
    }));
  };

  const facts = getFacts();

  const prepareFacts = (facts: IDemographicFact[]) => {
    // eslint-disable-next-line
    console.log(facts);

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

  const height = 700;
  const width = 1000;

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
      <div id="chart-container" style={{ width: "100%", height: "100%" }}>
        <BarChartCenterAxis fields={chart} />
      </div>
    </>
  );
}
