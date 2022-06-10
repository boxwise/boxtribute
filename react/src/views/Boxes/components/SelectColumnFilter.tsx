import React from "react";
import { UseFiltersColumnProps } from "react-table";
import { BoxRow } from "./types";

export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}: {
  column: UseFiltersColumnProps<BoxRow> & { id: string };
}) {
  const options = React.useMemo(() => {
    const options = new Set<string>();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return Array.from(options.values());
  }, [id, preFilteredRows]);

  return (
    <select
      id={id}
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
    >
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
