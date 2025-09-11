import { SelectColumnFilterUI } from "components/Table/Filter";
import { ColumnInstance } from "react-table";
import { BoxRow } from "./types";
import { boxStateIds } from "utils/constants";

interface ISelectBoxStateFilterProps {
  column: ColumnInstance<BoxRow>;
}

// Custom filter-selection UI to display all states for selection, not just the ones that are
// present in the table data
export function SelectBoxStateFilter({ column }: ISelectBoxStateFilterProps) {
  const options = Object.entries(boxStateIds).map(([name, id]) => ({
    label: name,
    value: { name, id },
  }));

  return (
    <SelectColumnFilterUI
      options={options}
      render={column.render}
      filterValue={column.filterValue}
      setFilter={column.setFilter}
      id={column.id}
    />
  );
}
