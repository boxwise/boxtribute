import { makeVar } from "@apollo/client";

export const selectedCharts = makeVar<string[]>([]);

export const select = (charts: string[], id: string) => {
  if (charts.indexOf(id) !== -1) {
    charts.push(id);
    selectedCharts(charts);
  }
};

export const deselect = (charts: string[], id: string) => {
  if (charts.indexOf(id) !== -1) {
    selectedCharts(charts.slice(charts.indexOf(id), 1));
  }
};

export const isSelected = (charts: string[], id: string) =>
  charts.indexOf(id) !== -1;
