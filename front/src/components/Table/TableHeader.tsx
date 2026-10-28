import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Thead, Tr, Th, chakra, HStack } from "@chakra-ui/react";
import { HeaderGroup } from "react-table";

interface IFilteringSortingTableHeaderProps {
  headerGroups: HeaderGroup<any>[];
  hideColumnFilters?: boolean;
  /** Replaces the sort handling of react-table if the sort state is controlled externally (e.g.
   * by URL search params). Only called for sortable columns. */
  onSortColumn?: (column: HeaderGroup<any>) => void;
}

export function FilteringSortingTableHeader({
  headerGroups,
  hideColumnFilters = false,
  onSortColumn,
}: IFilteringSortingTableHeaderProps) {
  return (
    <Thead position="sticky" top={0} background="gray.100" zIndex={2}>
      {headerGroups.map((headerGroup: HeaderGroup, idx) => (
        <Tr {...headerGroup.getHeaderGroupProps()} key={idx}>
          {headerGroup.headers.map((column, idx) => (
            <Th {...column.getHeaderProps()} color="black" key={idx}>
              <HStack alignItems="center" spacing={1}>
                {column.isSorted && column.isSortedDesc && (
                  <TriangleDownIcon aria-label="sorted descending" />
                )}
                {column.isSorted && !column.isSortedDesc && (
                  <TriangleUpIcon aria-label="sorted ascending" />
                )}
                <div
                  {...(onSortColumn && column.canSort
                    ? column.getSortByToggleProps({ onClick: () => onSortColumn(column) })
                    : column.getSortByToggleProps())}
                >
                  {column.render("Header")}
                </div>
                {!hideColumnFilters && column.Filter && column.canFilter && (
                  <chakra.span>{column.render("Filter")}</chakra.span>
                )}
              </HStack>
            </Th>
          ))}
        </Tr>
      ))}
    </Thead>
  );
}
