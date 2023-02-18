import {
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger as OrigPopoverTrigger,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { FC, ReactNode, useMemo } from "react";
import { MdFilterList, MdFilterListAlt } from "react-icons/md";

// Fix for https://github.com/chakra-ui/chakra-ui/issues/5896
export const PopoverTrigger: FC<{ children: ReactNode }> = OrigPopoverTrigger;

// This is a custom filter UI for selecting
// a unique option from a list
// https://react-table-v7.tanstack.com/docs/examples/filtering
export function SelectColumnFilter({
  column: { render, filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = useMemo(() => {
    const groupedOptions = new Set<string | number | readonly string[] | undefined>();
    preFilteredRows.forEach((row) => {
      const value = row.values[id];
      if (typeof value === "object" && value !== null) {
        groupedOptions.add(Object.values(value).join(" - "));
      } else {
        groupedOptions.add(value);
      }
    });
    return Array.from(groupedOptions.values()).map((groupedOption) => ({
      value: groupedOption,
      label: groupedOption,
    }));
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          size="xs"
          background="inherit"
          icon={filterValue ? <MdFilterListAlt /> : <MdFilterList />}
          aria-label={`Filter for '${render("Header")}'`}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody textStyle="h1">
          <Select
            size="sm"
            value={filterValue && filterValue.map((value) => ({ value, label: value }))}
            placeholder="All"
            onChange={(selectedOptions) => {
              setFilter(selectedOptions.map((selectedOption) => selectedOption.value) || undefined);
            }}
            options={options}
            isMulti
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
