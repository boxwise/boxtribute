import { IoCaretDown, IoCaretUp } from "react-icons/io5";
import { Table, chakra, HStack } from "@chakra-ui/react";
import { HeaderGroup } from "react-table";

interface IFilteringSortingTableHeaderProps {
  headerGroups: HeaderGroup<any>[];
}

export function FilteringSortingTableHeader({ headerGroups }: IFilteringSortingTableHeaderProps) {
  return (
    <Table.Header position="sticky" top={0} background="white" zIndex={2}>
      {headerGroups.map((headerGroup: HeaderGroup, idx) => (
        <Table.Row {...headerGroup.getHeaderGroupProps()} key={idx}>
          {headerGroup.headers.map((column, idx) => (
            <Table.ColumnHeader {...column.getHeaderProps()} color="black" key={idx}>
              <HStack alignItems="center" gap={1}>
                {column.isSorted && column.isSortedDesc && (
                  <IoCaretDown aria-label="sorted descending" />
                )}
                {column.isSorted && !column.isSortedDesc && (
                  <IoCaretUp aria-label="sorted ascending" />
                )}
                <div {...column.getSortByToggleProps()}>{column.render("Header")}</div>
                {column.Filter && column.canFilter && (
                  <chakra.span>{column.render("Filter")}</chakra.span>
                )}
              </HStack>
            </Table.ColumnHeader>
          ))}
        </Table.Row>
      ))}
    </Table.Header>
  );
}
