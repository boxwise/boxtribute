import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Skeleton, Text } from "@chakra-ui/react";

interface IPaginationControlsProps {
  currentPage: number;
  maxPage: number;
  /** The maximum page is not known until the totals are loaded */
  isMaxPageLoading: boolean;
  onPageChange: (page: number) => void;
  isNextDisabled?: boolean;
}

export function PaginationControls({
  currentPage,
  maxPage,
  isMaxPageLoading,
  onPageChange,
  isNextDisabled = false,
}: IPaginationControlsProps) {
  return (
    <Flex justifyContent="center" alignItems="center" key="pagination" flex="none">
      <Flex>
        <IconButton
          aria-label="Previous Page"
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage <= 1}
          icon={<ChevronLeftIcon h={6} w={6} />}
        />
      </Flex>

      <Flex justifyContent="center" m={4}>
        <Text as="span" data-testid="page-indicator">
          Page{" "}
          <Text fontWeight="bold" as="span">
            {currentPage}
          </Text>{" "}
          of{" "}
          {isMaxPageLoading ? (
            <Skeleton height={5} width={10} mr={2} />
          ) : (
            <Text fontWeight="bold" as="span">
              {maxPage}
            </Text>
          )}
        </Text>
      </Flex>

      <Flex>
        <IconButton
          aria-label="Next Page"
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={isNextDisabled || currentPage >= maxPage}
          icon={<ChevronRightIcon h={6} w={6} />}
        />
      </Flex>
    </Flex>
  );
}
