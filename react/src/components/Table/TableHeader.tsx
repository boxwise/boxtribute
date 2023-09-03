/* eslint-disable no-nested-ternary */
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Thead, Tr, Th, Flex, chakra, Spacer } from "@chakra-ui/react";
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
            <Th {...column.getHeaderProps()}>
              <Flex alignItems="center">
                <chakra.span pl="1">
                  {column.isSorted && column.isSortedDesc && (
                    <TriangleDownIcon aria-label="sorted descending" />
                  )}
                  {column.isSorted && !column.isSortedDesc && (
                    <TriangleUpIcon aria-label="sorted ascending" />
                  )}
                </chakra.span>
                <Spacer />
                <div {...column.getSortByToggleProps()}>{column.render("Header")}</div>

                <Spacer />
                {column.Filter && column.canFilter && (
                  <chakra.span pr="1">{column.render("Filter")}</chakra.span>
                )}
              </Flex>
            </Th>
          ))}
        </Tr>
      ))}
    </Thead>
  );
}
