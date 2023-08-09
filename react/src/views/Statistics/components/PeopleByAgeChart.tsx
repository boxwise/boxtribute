import BarChartCenterAxis, { IBarChartCenterAxis } from "components/graphs/BarChartCenterAxis";
import { random, uniq } from "lodash";

const chartData: { age: number; gender: string; people: number }[] = [];

for (let i = 1; i < 50; i += 1) {
  let current = { age: i, gender: "F", people: random(80, false) };
  chartData.push(current);
  current = { age: i, gender: "M", people: random(60, false) };
  chartData.push(current);
}

const dataXr = chartData
  .filter((value) => value.gender === "M")
  .map((element) => ({ x: element.people, y: element.age }));
const dataXl = chartData
  .filter((value) => value.gender === "F")
  .map((element) => ({ x: element.people, y: element.age }));

const height = 500;
const width = 400;

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
