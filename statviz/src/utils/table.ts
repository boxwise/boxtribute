interface Table {
  createdOn?: string;
}

export function table<T extends Table>(f: Array<T>) {
  const data = f;

  return {
    data,
    filter: (filter: (row: T) => boolean) => {
      return table(data.filter(filter));
    },
    groupBySum: (
      by: keyof T,
      sum: Array<keyof T>,
      connectedKeys: Array<keyof T> = []
    ) => {
      const keys = [...sum, by, ...connectedKeys];
      const grouped: T[] = [];

      data.map((row) => {
        const i = grouped.findIndex((e) => e[by] === row[by]);

        if (i === -1) {
          const newRow: T = {} as T;
          keys.map((e) => (newRow[e] = row[e]));
          grouped.push(newRow);
          return;
        }
        sum.map((f) => {
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
  };
}
