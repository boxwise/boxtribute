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

interface ISelectOption {
  label: string;
  value: string | object;
}

// Utility Function to show Objects in filter in a more readible way
function ObjectToString(object: Object) {
  return Object.values(object).join(" - ");
}

// This is a custom filter UI for selecting
// a unique option from a list
// https://react-table-v7.tanstack.com/docs/examples/filtering
export function SelectColumnFilter({
  column: { render, filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = useMemo(() => {
    const groupedOptionLabels = new Set<string | number>();
    const optionValues = {};
    preFilteredRows.forEach((row) => {
      const value = row.values[id];
      // if the data passed to the table is more complex than a string we need to pass the data as value
      if (typeof value === "object" && value !== null) {
        const objectToString = ObjectToString(value);
        groupedOptionLabels.add(objectToString);
        optionValues[objectToString] = value;
      } else {
        groupedOptionLabels.add(value);
        optionValues[value] = value;
      }
    });
    return Array.from(groupedOptionLabels.values()).map(
      (label) =>
        ({
          label,
          value: optionValues[label],
        } as ISelectOption),
    );
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
            value={
              filterValue &&
              filterValue.map((value) => {
                if (typeof value === "object" && value !== null) {
                  return { value, label: ObjectToString(value) };
                }
                return { value, label: value };
              })
            }
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

// This is a custom filter function for columns that consist of objects
// https://react-table-v7.tanstack.com/docs/examples/filtering
export const includesSomeObjectFilterFn = (rows, ids, filterValue) =>
  rows.filter((row) =>
    ids.some((id) => {
      const rowValue = row.values[id];
      return (
        rowValue &&
        filterValue.some((valObject) => JSON.stringify(rowValue) === JSON.stringify(valObject))
      );
    }),
  );
includesSomeObjectFilterFn.autoRemove = (val) => !val || !val.length;
