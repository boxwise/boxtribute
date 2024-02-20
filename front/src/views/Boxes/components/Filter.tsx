import { SelectColumnFilterUI } from "components/Table/Filter";
import { ColumnInstance } from "react-table";
import { BoxState } from "types/generated/graphql";
import { BoxRow } from "./types";

interface ISelectBoxStateFilterProps {
  column: ColumnInstance<BoxRow>;
}

export function SelectBoxStateFilter({ column }: ISelectBoxStateFilterProps) {
  const options = Object.keys(BoxState).map((state) => ({ label: state, value: state }));

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
