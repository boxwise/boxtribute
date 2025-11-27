import {
  PopoverRoot,
  Box,
  PopoverContent,
  PopoverArrow,
  PopoverCloseTrigger,
  PopoverBody,
  Flex,
  Checkbox,
  PopoverTrigger,
  Button,
} from "@chakra-ui/react";
import { ColumnInstance } from "react-table";
import { RiLayoutColumnFill } from "react-icons/ri";

interface IColumnSelectorProps {
  availableColumns: ColumnInstance<Record<string, unknown>>[];
}

function ColumnSelector({ availableColumns }: IColumnSelectorProps) {
  const selectedColumnsCount = availableColumns.filter(
    (column) => column.getToggleHiddenProps().checked,
  ).length;

  return (
    <PopoverRoot>
      <PopoverTrigger asChild>
        <Box position="relative">
          <Button aria-label="Columns Shown">
            <RiLayoutColumnFill />
            {selectedColumnsCount}
          </Button>
        </Box>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseTrigger />
        <PopoverBody textStyle="h1">
          <Flex flexWrap="wrap">
            {availableColumns.map((column) => (
              <Checkbox.Root
                m={1}
                py={1}
                px={2}
                border="1px"
                colorPalette="gray"
                borderColor="gray.200"
                key={`ColumnSelector-${column.id}`}
                defaultChecked={column.getToggleHiddenProps().checked}
                {...column.getToggleHiddenProps()}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>{column.render("Header")}</Checkbox.Label>
              </Checkbox.Root>
            ))}
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
}

export default ColumnSelector;
