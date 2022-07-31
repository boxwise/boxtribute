import { Select } from "@chakra-ui/react";
import React from "react";
import { UseFiltersColumnProps } from "react-table";
import { BoxRow } from "./types";

export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}: {
  column: UseFiltersColumnProps<BoxRow> & { id: string };
})  {
  const options = React.useMemo(() => {
    const options = new Set<string>();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return Array.from(options.values());
  }, [id, preFilteredRows]);
  // & { setFilterActive: () => void }
  return (
    <Select
      // borderColor='tomato'
      // onClick={() => setFilterActive()}
      border="0px"
      borderRadius="0px"
      w='100px'
      overflow='hidden'
      // m="10px"
      _focus={{
        minWidth: "150px",
        width: "fit-content",
      }}
      
      cursor="pointer"
      id={id}
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
    >
      <option value=""></option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </Select>
  );
}
