/* eslint-disable no-nested-ternary */
import { TriangleDownIcon, TriangleUpIcon, ArrowUpDownIcon } from "@chakra-ui/icons";
import { Thead, Tr, Th, Flex, chakra, Spacer, IconButton } from "@chakra-ui/react";
import { HeaderGroup } from "react-table";

interface IFilteringSortingTableHeaderProps {
  headerGroups: HeaderGroup<any>[];
}

export function FilteringSortingTableHeader({ headerGroups }: IFilteringSortingTableHeaderProps) {
  return (
    <Thead>
      {headerGroups.map((headerGroup) => (
        <Tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map((column) => (
            // console.log("column", column);
            // column.render;
            // const FOO = <div>BAR</div>;
            // console.log("column", column);
            <Th {...column.getHeaderProps()}>
              <Flex alignItems="center">
                {/* {JSON.stringify(column)} */}
                {column.Filter && <chakra.span pr="1">{column.render("Filter")}</chakra.span>}
                {column.render("Header")}
                <Spacer />
                <chakra.span pl="1">
                  <IconButton
                    size="xs"
                    background="inherit"
                    aria-label={`Toggle SortBy for '${column.render("Header")}'`}
                    icon={
                      column.isSorted ? (
                        column.isSortedDesc ? (
                          <TriangleDownIcon aria-label="sorted descending" />
                        ) : (
                          <TriangleUpIcon aria-label="sorted ascending" />
                        )
                      ) : (
                        <ArrowUpDownIcon />
                      )
                    }
                    {...column.getSortByToggleProps()}
                  />
                </chakra.span>
              </Flex>
            </Th>
          ))}
        </Tr>
      ))}
    </Thead>
  );
}
