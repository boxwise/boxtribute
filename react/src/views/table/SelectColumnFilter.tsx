import React from "react";
import { UseFiltersColumnProps } from "react-table";
import { ProductRow } from "./Table";

export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}: {
  column: UseFiltersColumnProps<ProductRow> & { id: string };
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
