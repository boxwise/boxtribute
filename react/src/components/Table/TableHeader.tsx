/* eslint-disable no-nested-ternary */
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Thead, Tr, Th, Flex, chakra, Spacer } from "@chakra-ui/react";
import { ReactElement, ReactNode } from "react";
import { Column, HeaderGroup } from "react-table";

interface IFilteringSortingTableHeaderProps {
  headerGroups: HeaderGroup<any>[];
}

export function FilteringSortingTableHeader({ headerGroups }: IFilteringSortingTableHeaderProps) {
  return (
    <Thead>
      {headerGroups.map((headerGroup: HeaderGroup) => (
        <Tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map((header: HeaderGroup<any>) => (
            <Th {...header.getHeaderProps()}>
              <Flex alignItems="center">
                <div {...header.getSortByToggleProps()}>
                  <chakra.span pl="1">
                    {header.isSorted && header.isSortedDesc && (
                      <TriangleDownIcon aria-label="sorted descending" />
                    )}
                    {header.isSorted && !header.isSortedDesc && (
                      <TriangleUpIcon aria-label="sorted ascending" />
                    )}
                  </chakra.span>
                  <Spacer />
                  {header.render("Header") as ReactElement}
                </div>

                <Spacer />
                {header.Filter && header.canFilter && (
                  <chakra.span pr="1">{header.render("Filter") as ReactElement}</chakra.span>
                )}
              </Flex>
            </Th>
          ))}
        </Tr>
      ))}
    </Thead>
  );
}
