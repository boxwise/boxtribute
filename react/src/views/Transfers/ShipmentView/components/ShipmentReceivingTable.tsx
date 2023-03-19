/* eslint-disable no-nested-ternary */
import {
  Box,
  Box as BoxWrapper,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";
import { BsFillChatDotsFill } from "react-icons/bs";

import { Column, useTable, useSortBy } from "react-table";

interface IShipmentReceivingTablePros {
  columns: Array<Column<any>>;
  data: Array<any>;
}

function ShipmentReceivingTable({ columns, data }: IShipmentReceivingTablePros) {
  const tableData = useMemo(() => data, [data]);

  const tableInstance = useTable(
    {
      columns,
      data: tableData,

      initialState: {
        sortBy: [
          {
            id: "labelIdentifier",
            desc: true,
          },
        ],
        hiddenColumns: columns
          .filter((col: any) => col.show === false)
          .map((col) => col.id || col.accessor) as any,
      },
    },
    useSortBy,
  );
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const maxTableWidth = useBreakpointValue({ base: "full", md: "100%" });

  return (
    <BoxWrapper overflowX="hidden" overflowY="hidden">
      <TableContainer maxW={maxTableWidth}>
        <Table {...getTableProps()} variant="simple" size="sm">
          <Thead>
            {headerGroups.map((headerGroup) => (
              <Tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  // Add the sorting props to control sorting. For this example
                  // we can add them into the header props
                  <Th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    <Wrap>
                      <WrapItem>{column.render("Header")}</WrapItem>
                      {/* Add a sort direction indicator */}
                      <WrapItem>
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <RiArrowDownSFill />
                          ) : (
                            <RiArrowUpSFill />
                          )
                        ) : (
                          ""
                        )}
                      </WrapItem>
                    </Wrap>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody {...getTableBodyProps()}>
            {}
            {rows.map((row) => {
              prepareRow(row);

              return (
                <Tr {...row.getRowProps()}>
                  <Td
                    {...row.cells[0].getCellProps()}
                    style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", fontSize: "xs" }}
                  >
                    <VStack spacing={4} align="stretch">
                      <Box fontWeight={row.cells[0].column.isSorted ? "bold" : "normal"}>
                        <Wrap>
                          <WrapItem>{row.cells[0].row.original.labelIdentifier}</WrapItem>
                          <WrapItem>
                            {row.cells[0].row.original.comment && <BsFillChatDotsFill />}
                          </WrapItem>
                        </Wrap>
                      </Box>
                      <Box color="gray.500">SIZE: {row.cells[0].row.original.size}</Box>
                    </VStack>
                  </Td>
                  <Td
                    colSpan={2}
                    {...row.cells[1].getCellProps()}
                    style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", fontSize: "xs" }}
                  >
                    <VStack spacing={4} align="stretch">
                      <Box fontWeight={row.cells[1].column.isSorted ? "bold" : "normal"}>
                        {row.cells[0].row.original.product}({row.cells[0].row.original.items}x)
                      </Box>
                      <Box />
                    </VStack>
                  </Td>
                  <Td
                    {...row.cells[1].getCellProps()}
                    style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", fontSize: "xs" }}
                  >
                    <VStack spacing={4} align="stretch">
                      <Box />
                      <Box
                        fontWeight={row.cells[2].column.isSorted ? "bold" : "normal"}
                        color="gray.500"
                      >
                        {row.cells[0].row.original.gender === "none"
                          ? ""
                          : row.cells[0].row.original.gender}
                      </Box>
                    </VStack>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </BoxWrapper>
  );
}

export default ShipmentReceivingTable;
