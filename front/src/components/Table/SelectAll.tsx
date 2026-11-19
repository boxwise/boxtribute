import { Box, Flex, HStack, Skeleton, Text } from "@chakra-ui/react";

interface ISelectAllProps {
  /** Number of rows that are selected, or of all rows if select-all is active */
  selectedCount: number;
  isSelectAll: boolean;
  isLoading: boolean;
  totalCount: number;
  /** E.g. "3 Boxes selected" */
  selectedText: string;
  /** E.g. "Select all 10 boxes" */
  selectAllText: string;
  clearText?: string;
  onSelectAll: () => void;
  onClear: () => void;
  testId?: string;
}

/** Shows the number of selected rows with a link to clear the selection, and a link to select all
 * rows that match the filters of the table (including the ones that are not loaded). */
export function SelectAll({
  selectedCount,
  isSelectAll,
  isLoading,
  totalCount,
  selectedText,
  selectAllText,
  clearText = "Clear all",
  onSelectAll,
  onClear,
  testId,
}: ISelectAllProps) {
  return (
    <Flex alignItems="center" mb={2} flex="none" data-testid={testId}>
      {selectedCount > 0 && (
        <HStack spacing={5} bg="blue.100" px={4} py={2}>
          <Text as="span" fontWeight="bold" color="black">
            {selectedText}
          </Text>{" "}
          <Text as="span" color="black" cursor="pointer" onClick={onClear}>
            {clearText}
          </Text>
        </HStack>
      )}
      {selectedCount > 0 && !isSelectAll && (
        <Box as="span" color="gray.400" ml={4}>
          |
        </Box>
      )}
      {isLoading ? (
        <HStack spacing={2}>
          <Skeleton height={5} width={20} />
        </HStack>
      ) : (
        !isSelectAll && (
          <Text
            mx={4}
            py={2}
            cursor={totalCount === 0 ? "default" : "pointer"}
            color={totalCount === 0 ? "gray.400" : "black"}
            onClick={() => {
              if (totalCount > 0) onSelectAll();
            }}
          >
            {selectAllText}
          </Text>
        )
      )}
    </Flex>
  );
}
