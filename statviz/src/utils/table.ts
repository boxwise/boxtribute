import _ from "lodash";

export enum Sort {
  asc = "asc",
  desc = "desc",
}

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
    innerJoin: (foreignTable, column: keyof Row, foreignColumn: string) => {
      const joinedTable = data.map((row) => {
        const foreignIndex = foreignTable.data.findIndex(
          (e) => e[foreignColumn] == row[column]
        );
        if (foreignIndex !== -1) {
          return {
            ...row,
            ...foreignTable.data[foreignIndex],
          };
        }
      });

      return table(joinedTable);
    },
  };
}
