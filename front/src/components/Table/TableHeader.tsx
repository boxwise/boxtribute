import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Thead, Tr, Th, chakra, HStack } from "@chakra-ui/react";
import { HeaderGroup } from "react-table";

interface IFilteringSortingTableHeaderProps {
  headerGroups: HeaderGroup<any>[];
}

export function FilteringSortingTableHeader({ headerGroups }: IFilteringSortingTableHeaderProps) {
  return (
    <Thead position="sticky" top={0} background="white" zIndex={2}>
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
