import {
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger as OrigPopoverTrigger,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { FC, ReactNode, useMemo } from "react";
import { MdFilterList, MdFilterListAlt } from "react-icons/md";
import { FilterValue } from "react-table";

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

export function SelectColumnFilterUI({
  options,
  render,
  filterValue,
  setFilter,
  id,
}: {
  options: ISelectOption[];
  render: (type: "Header" | "Footer" | string, props?: object) => React.ReactNode;
  filterValue: FilterValue;
  setFilter: any;
  id: string;
}) {
  // Render a multi-select box
  return (
    <Popover isLazy={true}>
      <PopoverTrigger>
        <IconButton
          size="xs"
          background="inherit"
          icon={filterValue ? <MdFilterListAlt /> : <MdFilterList />}
          aria-label={`Filter for '${render("Header")}'`}
          data-testid={`filter-${id}`}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
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

// This is a custom filter UI for selecting
// a unique option from a list
// https://react-table-v7.tanstack.com/docs/examples/filtering
export function SelectColumnFilter({
  column: { render, filterValue, setFilter, preFilteredRows, id },
}: {
  column: {
    render: (type: "Header" | "Footer" | string, props?: object) => React.ReactNode;
    filterValue: any;
    setFilter: any;
    preFilteredRows: any;
    id: string;
  };
}) {
  const selected = preFilteredRows[3].values[id];
  console.log(selected);
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
      } else if (value !== undefined) {
        groupedOptionLabels.add(value);
        optionValues[value] = value;
      }
    });
    return Array.from(groupedOptionLabels.values())
      .map(
        (label) =>
          ({
            label,
            value: optionValues[label],
          }) as ISelectOption,
      )
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [id, preFilteredRows]);

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

// This is a custom filter function for columns that consist of objects
// https://react-table-v7.tanstack.com/docs/examples/filtering
export const includesOneOfMultipleStringsFilterFn = (rows, ids, filterValue) =>
  rows.filter((row) =>
    ids.some((id) => {
      const rowValue = row.values[id];
      return (
        typeof rowValue === "string" &&
        rowValue.length &&
        Array.isArray(filterValue) &&
        filterValue.some((val) => val === rowValue)
      );
    }),
  );
includesOneOfMultipleStringsFilterFn.autoRemove = (val) => !val || !val.length;
