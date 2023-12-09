import { SelectColumnFilterUI } from "components/Table/Filter";
import { BoxState } from "types/generated/graphql";

export function SelectBoxStateFilter({ column: { render, filterValue, setFilter, id } }) {
  const options = Object.keys(BoxState).map((state) => ({ label: state, value: state }));

  return (
    <SelectColumnFilterUI
      options={options}
      render={render}
      filterValue={filterValue}
      setFilter={setFilter}
      id={id}
    />
  );
}
