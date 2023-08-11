import { useState } from "react";
import { Heading } from "@chakra-ui/react";
import BarChartCenterAxis from "components/graphs/BarChartCenterAxis";
import { range } from "lodash";
import { HumanGender } from "types/generated/graphql";
import { beneficiaryDemographicsMock } from "mocks/demographic";
import FilterCreatedOn from "./filter/FilterCreatedOn";

export default function DemographicChart() {
  const dataRaw = { ...beneficiaryDemographicsMock.data };

  const [demographicDataCube, setDemographicDataCube] = useState({
    ...dataRaw,
    beneficiaryDemographics: dataRaw.beneficiaryDemographics.map((e) => ({
      ...e,
      createdOn: new Date(e.createdOn),
    })),
  });

  const dataXr = demographicDataCube.beneficiaryDemographics
    .filter((value) => value.gender === HumanGender.Male)
    .map((e) => ({ x: e.count, y: e.age }));

  const dataXl = demographicDataCube.beneficiaryDemographics
    .filter((value) => value.gender === HumanGender.Female)
    .map((e) => ({ x: e.count, y: e.age }));

  const maxAge: number = demographicDataCube.beneficiaryDemographics.reduce(
    (acc: number, current) => {
      if (current.age > acc) return current.age;
      return acc;
    },
    0,
  );

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

  /* eslint-disable */
  const onFilterChange = (e: any) => {
    /* eslint-disable */
    console.log(e);

    // setDemographicDataCube(e)
  };

  return (
    <>
      <Heading>Demographic Chart</Heading>
      <FilterCreatedOn
        onSubmit={onFilterChange}
        data={demographicDataCube.beneficiaryDemographics}
      />
      <div id="chart-container" style={{ width: "100%", height: "100%" }}>
        <BarChartCenterAxis fields={chart} />
      </div>
    </>
  );
}
