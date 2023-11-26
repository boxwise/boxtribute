/* eslint-disable no-nested-ternary */
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Thead, Tr, Th, chakra, HStack } from "@chakra-ui/react";
import { HeaderGroup } from "react-table";

interface IFilteringSortingTableHeaderProps {
  headerGroups: HeaderGroup<any>[];
}

export function FilteringSortingTableHeader({ headerGroups }: IFilteringSortingTableHeaderProps) {
  return (
    <Thead>
      {headerGroups.map((headerGroup: HeaderGroup) => (
        <Tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map((column) => (
            <Th {...column.getHeaderProps()} color="black">
              <HStack alignItems="center" spacing={1}>
                {column.isSorted && column.isSortedDesc && (
                  <TriangleDownIcon aria-label="sorted descending" />
                )}
                {column.isSorted && !column.isSortedDesc && (
                  <TriangleUpIcon aria-label="sorted ascending" />
                )}
                <div {...column.getSortByToggleProps()}>{column.render("Header")}</div>
                {column.Filter && column.canFilter && (
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
