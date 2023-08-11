import { Heading } from "@chakra-ui/react";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import BarChartCenterAxis from "components/graphs/BarChartCenterAxis";
import { range, uniq } from "lodash";
import { BeneficiaryDemographicsResult, HumanGender } from "types/generated/graphql";
import { useCallback, useState } from "react";

const chartData: { age: number; gender: string; count: number }[] = [];

const client = new ApolloClient({
  uri: "http://localhost:5005/public",
  cache: new InMemoryCache(),
});

export default function DemographicChart() {
  const [data, setData] = useState<any>(null);

  client
    .query<{
      beneficiaryDemographics: {
        age: number;
        count: number;
        gender: HumanGender;
        cratedOn: string;
      }[];
    }>({
      query: gql`
        query BeneficiaryDemographics {
          beneficiaryDemographics(baseIds: [1]) {
            age
            count
            gender
            createdOn
          }
        }
      `,
    })
    .then((result) => setData(result));

  if (data === null) {
    return <p>loading</p>;
  }

  const dataXr = data.beneficiaryDemographics
    .filter((value) => value.gender === HumanGender.Male)
    .map((e) => ({ x: e.count, y: e.age }));

  const dataXl = data.beneficiaryDemographics
    .filter((value) => value.gender === HumanGender.Female)
    .map((e) => ({ x: e.count, y: e.age }));

  const maxAge: number = data.beneficiaryDemographics.reduce((acc: number, current) => {
    if (current.age > acc) return current.age;
    return acc;
  }, 0);

  const height = 600;
  const width = 800;

  const chart = {
    labelY: "Age",
    labelXr: "Male",
    labelXl: "Female",
    dataY: range(1, maxAge),
    dataXr,
    dataXl,
    width,
    height,
    background: "#ffffff",
    colorBarLeft: "#ec5063",
    colorBarRight: "#31cab5",
    settings: {
      hideZeroY: true,
    },
  };

  return (
    <>
      <Heading>Demographic Chart</Heading>
      <div id="chart-container" style={{ width: "100%", height: "100%" }}>
        <BarChartCenterAxis fields={chart} />
      </div>
    </>
  );
}
