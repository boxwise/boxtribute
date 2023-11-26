import {
  Popover,
  Box,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Flex,
  Checkbox,
  PopoverTrigger as OrigPopoverTrigger,
  Button,
} from "@chakra-ui/react";
import React, { useMemo } from "react";
import { Column } from "react-table";
import { RiLayoutColumnFill } from "react-icons/ri";
import { BoxRow } from "./types";

const PopoverTrigger: React.FC<{ children: React.ReactNode }> = OrigPopoverTrigger;

interface IColumnSelectorProps {
  availableColumns: Column<BoxRow>[];
  setSelectedColumns: (columns: Column<BoxRow>[]) => void;
  selectedColumns: Column<BoxRow>[];
}

const mapColumnsToColumnOptionCollection = (columns: Column<BoxRow>[]) =>
  columns
    .map((column) => ({
      label: column.Header?.toString() || "",
      value: column.accessor?.toString() || "",
    }))
    .filter((value) => value !== undefined);

function ColumnSelector({
  availableColumns,
  setSelectedColumns,
  selectedColumns,
}: IColumnSelectorProps) {
  const allAvailableColumnOptions = useMemo(
    () => mapColumnsToColumnOptionCollection(availableColumns),
    [availableColumns],
  );

  const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    const columnId = e.target.value;
    const column = availableColumns.find((col) => col.id === columnId);
    if (column != null) {
      if (checked) {
        setSelectedColumns(
          selectedColumns.includes(column) ? selectedColumns : [...selectedColumns, column],
        );
      } else {
        setSelectedColumns(selectedColumns.filter((c) => c !== column));
      }
    }
  };

  const selectedColumnOptions = mapColumnsToColumnOptionCollection(selectedColumns);

  return (
    <Popover>
      <PopoverTrigger>
        <Box position="relative">
          <Button aria-label="Columns Shown" leftIcon={<RiLayoutColumnFill />}>
            {selectedColumns.length}
          </Button>
        </Box>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody textStyle="h1">
          <Flex flexWrap="wrap">
            {allAvailableColumnOptions.map((columnOption) => (
              <Checkbox
                m={1}
                py={1}
                px={2}
                border="1px"
                colorScheme="gray"
                borderColor="gray.200"
                onChange={onCheckboxChange}
                key={columnOption.value}
                defaultChecked={selectedColumnOptions
                  .map((c) => c.value)
                  .includes(columnOption.value)}
                value={columnOption.value}
              >
                {columnOption.label}
              </Checkbox>
            ))}
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export default ColumnSelector;
