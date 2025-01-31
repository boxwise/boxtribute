import { SelectColumnFilterUI } from "components/Table/Filter";
import { ColumnInstance } from "react-table";
import { BoxState } from "queries/types";
import { ProductRow } from "./transformers";

interface ISelectBoxStateFilterProps {
  column: ColumnInstance<ProductRow>;
}

export function SelectBoxStateFilter({ column }: ISelectBoxStateFilterProps) {
  const boxState: BoxState[] = [
    "Donated",
    "InStock",
    "InTransit",
    "Lost",
    "MarkedForShipment",
    "NotDelivered",
    "NotDelivered",
    "Receiving",
    "Scrap",
  ];
  const options = boxState.map((state) => ({ label: state, value: state }));

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
