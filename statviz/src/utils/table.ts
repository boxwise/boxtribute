import _, { join } from "lodash";
import {
  BeneficiaryDemographicsResult,
  CreatedBoxesResult,
  MovedBoxesResult,
} from "../types/generated/graphql";
import { Interval, eachDayOfInterval, isWithinInterval } from "date-fns";

type Fact = object;
type Dim = object;
type FactKey = keyof Fact;
type DimKey = keyof Dim;

export enum Sort {
  asc = "asc",
  desc = "desc",
}

export function joinFactWidthDim() {}

export function table<Row extends object>(f: Array<Row>) {
  const data = f;

  return {
    data,
    filter: (filter: (row: Row) => boolean) => {
      return table(data.filter(filter));
    },
    groupBySum: (
      column: keyof Row,
      sumColumns: Array<keyof Row>,
      connectedColumns: Array<keyof Row> = []
    ) => {
      const keys = [...sumColumns, column, ...connectedColumns];
      const grouped: Row[] = [];

      data.map((row) => {
        const i = grouped.findIndex((e) => e[column] === row[column]);

        if (i === -1) {
          const newRow: Row = {} as Row;
          keys.map((e) => (newRow[e] = row[e]));
          grouped.push(newRow);
          return;
        }
        sumColumns.map((f) => {
          const calculatedRow = { ...grouped[i] };
          if (typeof grouped[i][f] !== "number" || typeof row[f] !== "number") {
            throw Error("GroupbySum method can only be used on numbers");
          }
          calculatedRow[f] = grouped[i][f] + row[f];

          grouped[i] = calculatedRow;
        });
      });

      return table(grouped);
    },
    sumColumn: (column: keyof Row): number => {
      let acc: number = 0;
      data.map((e) => (acc += parseInt(e[column])));
      return acc;
    },
    orderBy: (column: keyof Row, sort: Sort) => {
      return table(_.orderBy(data, [column], [sort]));
    },
    limit: (limit: number) => {
      return table(data.slice(0, limit));
    },
    filterFromTo: (interval: Interval, field: keyof Row) => {
      const result = data.filter((row) => {
        return isWithinInterval(new Date(row[field]), interval);
      });

      return table(result);
    },
    innerJoin: (foreignTable, column: keyof Row, foreignColumn: string) => {
      const joinedTable = data.map((row) => {
        const foreignIndex = foreignTable.data.findIndex(
          (e) => e[foreignColumn] == row[column]
        );
        if (foreignIndex !== -1) {
          return {
            ...foreignTable.data[foreignIndex],
            ...row,
          };
        }
      });

      return table(joinedTable);
    },
    leftJoin: (foreignTable, column: keyof Row, foreignColumn: string) => {
      const joinedTable = data.map((row) => {
        const foreignIndex = foreignTable.data.findIndex(
          (e) => e[foreignColumn] == row[column]
        );
        if (foreignIndex !== -1) {
          return {
            ...foreignTable.data[foreignIndex],
            ...row,
          };
        }
        return {
          ...row,
        };
      });

      return table(joinedTable);
    },
  };
}

export function createdBoxesTable(createdBoxes: CreatedBoxesResult[]) {
  const dataTable = table(createdBoxes);

  return {
    ...dataTable,
    filterCreatedOn: (interval: Interval) => {
      return createdBoxesTable(
        dataTable.filterFromTo(interval, "createdOn").data
      );
    },
    groupByCreatedOn: () => {
      return createdBoxesTable(
        dataTable.groupBySum("createdOn", ["boxesCount", "itemsCount"]).data
      );
    },
    removeMissingCreatedOn: () => {
      return createdBoxesTable(
        dataTable.data.filter((row) => row.createdOn !== null)
      );
    },

    fillMissingDaysNew: () => {},
    groupByWeek: () => {
      const interval: Interval = {
        start: new Date(dataTable.data[0].createdOn),
        end: new Date(dataTable.data[dataTable.data.length - 1].createdOn),
      };

      const eachWeek = eachWeekOfInterval(interval);

      const result = dataTable.data.reduce();
    },
    groupByMonth: () => {},
    groupByQuarter: () => {},
    groupByYear: () => {},
  };
}

export const demographicTable = (
  demographicFacts: BeneficiaryDemographicsResult[]
) => {
  const dataTable = table(demographicFacts);

  return {
    ...dataTable,
    filterCreatedOn: (interval: Interval) => {
      return demographicTable(
        dataTable.filterFromTo(interval, "createdOn").data
      );
    },
  };
};

export const movedBoxesTable = (movedBoxes: MovedBoxesResult[]) => {
  const dataTable = table(movedBoxes);

  return {
    ...dataTable,
    filterCreatedOn: (interval: Interval) => {
      return movedBoxesTable(dataTable.filterFromTo(interval, "movedOn").data);
    },
  };
};
