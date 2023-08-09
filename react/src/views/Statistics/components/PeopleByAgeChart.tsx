import BarChartCenterAxis, { IBarChartCenterAxis } from "components/graphs/BarChartCenterAxis";
import { random, uniq } from "lodash";

const dataCube = {
  factTable: [
    { gender: "M", age: 1, createdOn: "2021-06-22", people: 3 },
    { gender: "M", age: 1, created: "2021-07-12", people: 1 },
    { gender: "M", age: 1, created: "2021-08-04", people: 4 },
    { gender: "F", age: 1, created: "2021-06-22", people: 4 },
    { gender: "F", age: 1, created: "2021-07-12", people: 3 },
    { gender: "F", age: 1, created: "2021-08-04", people: 5 },
    { gender: "M", age: 2, created: "2021-06-22", people: 6 },
    { gender: "M", age: 2, created: "2021-07-12", people: 2 },
    { gender: "M", age: 2, created: "2021-08-04", people: 3 },
    { gender: "F", age: 2, created: "2021-06-22", people: 2 },
    { gender: "F", age: 2, created: "2021-07-12", people: 5 },
    { gender: "F", age: 2, created: "2021-08-04", people: 1 },
  ],
};

const chartData: { age: number; gender: string; people: number }[] = [];

for (let i = 1; i < 40; i += 1) {
  let current = { age: i, gender: "F", people: random(60, false) };
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

const chart = {
  labelY: "Age",
  labelXr: "Male",
  labelXl: "Female",
  dataY: uniq(chartData.map((value) => value.age)),
  dataXr,
  dataXl,
  width: 700,
  height: 600,
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
      <BarChartCenterAxis fields={chart} />
    </>
  );
}
