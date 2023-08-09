import BarChartCenterAxis from "components/graphs/BarChartCenterAxis";
import { random, uniq } from "lodash";
import { HumanGender } from "types/generated/graphql";

const chartData: { age: number; gender: string; count: number }[] = [];

for (let i = 1; i < 50; i += 1) {
  let current = { age: i, gender: HumanGender.Male, count: random(80, false) };
  chartData.push(current);
  current = { age: i, gender: HumanGender.Female, count: random(60, false) };
  chartData.push(current);
}

const dataXr = chartData
  .filter((value) => value.gender === HumanGender.Male)
  .map((element) => ({ x: element.count, y: element.age }));
const dataXl = chartData
  .filter((value) => value.gender === HumanGender.Female)
  .map((element) => ({ x: element.count, y: element.age }));

const height = 600;
const width = 800;

const chart = {
  labelY: "Age",
  labelXr: "Male",
  labelXl: "Female",
  dataY: uniq(chartData.map((value) => value.age)),
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

export default function PeopleByAgeChart() {
  return (
    <>
      <p>PeopleByAgeChart</p>
      <div id="chart-container" style={{ width: "100%", height: "100%" }}>
        <BarChartCenterAxis fields={chart} />
      </div>
    </>
  );
}
