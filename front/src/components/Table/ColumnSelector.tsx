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
import { ColumnInstance } from "react-table";
import { RiLayoutColumnFill } from "react-icons/ri";

const PopoverTrigger: React.FC<{ children: React.ReactNode }> = OrigPopoverTrigger;

interface IColumnSelectorProps {
  availableColumns: ColumnInstance<Record<string, unknown>>[];
}

function ColumnSelector({ availableColumns }: IColumnSelectorProps) {
  const selectedColumnsCount = availableColumns.filter(
    (column) => column.getToggleHiddenProps().checked,
  ).length;

  return (
    <Popover>
      <PopoverTrigger>
        <Box position="relative">
          <Button aria-label="Columns Shown" leftIcon={<RiLayoutColumnFill />}>
            {selectedColumnsCount}
          </Button>
        </Box>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody textStyle="h1">
          <Flex flexWrap="wrap">
            {availableColumns.map((column) => (
              <Checkbox
                m={1}
                py={1}
                px={2}
                border="1px"
                colorScheme="gray"
                borderColor="gray.200"
                key={`ColumnSelector-${column.id}`}
                defaultChecked={column.getToggleHiddenProps().checked}
                {...column.getToggleHiddenProps()}
              >
                {column.render("Header")}
              </Checkbox>
            ))}
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export default ColumnSelector;
