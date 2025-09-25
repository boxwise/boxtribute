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
            // filterValue is an array of IDs; display the matching options
            value={options.filter((o) => filterValue?.includes(o.value))}
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
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = useMemo(() => {
    const groupedOptionLabels = new Set<string | number>();
    const optionValues = {};
    preFilteredRows.forEach((row) => {
      const value = row.values[id];
      // If the data passed to the table is more complex than a string we need to pass IDs as value
      if (Array.isArray(value)) {
        // E.g. TagsCell on BoxesView contains a list of tags
        value.forEach((element: { name: string }) => {
          const objectToString = ObjectToString(element);
          groupedOptionLabels.add(objectToString);
          optionValues[objectToString] = element;
        });
      } else if (typeof value === "object" && value !== null) {
        const objectToString = ObjectToString(value);
        groupedOptionLabels.add(objectToString);
        if (id === "product") {
          // Show gender info for BoxesView product filter
          optionValues[objectToString] = {
            id: value.id,
            name: `${value.name} (${row.values.gender?.name})`,
          };
        } else {
          optionValues[objectToString] = value;
        }
      } else if (value !== undefined) {
        groupedOptionLabels.add(value);
        optionValues[value] = value;
      }
    });

    const result = Array.from(groupedOptionLabels.values())
      .map(
        (label) =>
          ({
            label: optionValues[label].name ?? label,
            value: optionValues[label].id ?? optionValues[label],
          }) as ISelectOption,
      )
      .sort((a, b) => a.label.localeCompare(b.label));
    return result;
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
      return rowValue && filterValue.some((filterId) => rowValue.id === filterId);
    }),
  );
includesSomeObjectFilterFn.autoRemove = (val) => !val || !val.length;

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

// This is a custom filter function for tags only.
export const includesSomeTagObjectFilterFn = (rows, ids, filterValue) =>
  rows.filter((row) =>
    ids.some((id) => {
      const rowTags = row.values[id];
      return filterValue.some((tagId) => rowTags.some((tag) => tag.id === tagId));
    }),
  );

includesSomeTagObjectFilterFn.autoRemove = (val) => !val || !val.length;
