/* eslint-disable no-nested-ternary */
import {
  Box,
  Box as BoxWrapper,
  chakra,
  Flex,
  IconButton,
  Spacer,
  Table,
  TableContainer,
  Text,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { BsFillChatDotsFill } from "react-icons/bs";

import { Column, useTable, useSortBy } from "react-table";
import { TriangleDownIcon, TriangleUpIcon, ArrowUpDownIcon } from "@chakra-ui/icons";
import { boxReconciliationOverlayVar } from "queries/cache";

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
    <BoxWrapper overflowX="hidden" border={1} borderColor="black" borderWidth="1px">
      <TableContainer maxW={maxTableWidth}>
        <Table {...getTableProps()} variant="simple" size="sm" borderColor="black">
          <Thead borderColor="black" borderWidth="1px">
            {headerGroups.map((headerGroup) => (
              <Tr {...headerGroup.getHeaderGroupProps()}>
                <Th
                  style={{
                    borderBottom: "1px solid black",
                  }}
                  colSpan={3}
                >
                  <Flex direction="row" alignContent="space-between" justifyContent="space-between">
                    {headerGroup.headers.map((column) => (
                      <Flex alignItems="center" key={column.id}>
                        {column.canFilter && (
                          <chakra.span pr="1">{column.render("Filter")}</chakra.span>
                        )}
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
                    ))}
                  </Flex>
                </Th>
              </Tr>
            ))}
          </Thead>
          <Tbody {...getTableBodyProps()}>
            {}
            {rows.map((row) => {
              prepareRow(row);

              return (
                <Tr
                  {...row.getRowProps()}
                  style={{ border: "1px solid black" }}
                  onClick={() =>
                    boxReconciliationOverlayVar({
                      labelIdentifier: row.original.labelIdentifier,
                      isOpen: true,
                    })
                  }
                >
                  <Td
                    colSpan={3}
                    {...row.cells[1].getCellProps()}
                    style={{
                      fontSize: "sm",
                      border: "1px solid black",
                    }}
                  >
                    <Box>
                      <Flex alignContent="space-around">
                        <Box
                          p={1}
                          width={["100px", "200px", "250px"]}
                          fontWeight={row.cells[0].column.isSorted ? "bold" : "normal"}
                        >
                          <Wrap>
                            <WrapItem>{row.cells[0].row.original.labelIdentifier}</WrapItem>
                            <WrapItem>
                              {row.cells[0].row.original.comment && (
                                <BsFillChatDotsFill color="#696969" />
                              )}
                            </WrapItem>
                          </Wrap>
                        </Box>
                        <Box fontWeight={row.cells[1].column.isSorted ? "bold" : "normal"}>
                          <Wrap spacing={1}>
                            <WrapItem>
                              <Text fontSize={16}>{row.cells[0].row.original.product}</Text>
                            </WrapItem>
                            <WrapItem>
                              <Text fontSize={12}>({row.cells[0].row.original.items}x)</Text>
                            </WrapItem>
                          </Wrap>
                        </Box>
                      </Flex>
                      <Flex alignContent="space-around">
                        <Box p={1} color="gray.500">
                          SIZE: {row.cells[0].row.original.size}
                        </Box>
                        <Spacer />
                        <Box
                          p={1}
                          color="gray.500"
                          fontWeight={row.cells[2].column.isSorted ? "bold" : "normal"}
                        >
                          {row.cells[0].row.original.gender === "none"
                            ? ""
                            : row.cells[0].row.original.gender}
                        </Box>
                      </Flex>
                    </Box>
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
