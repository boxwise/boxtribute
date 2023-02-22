import { DeleteIcon } from "@chakra-ui/icons";
import {
  Box as BoxWrapper,
  IconButton,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
} from "@chakra-ui/react";
import _ from "lodash";
import { useCallback, useEffect, useMemo } from "react";
import { Column, Row, useTable, useBlockLayout } from "react-table";
import { Box, Product } from "types/generated/graphql";

interface IShipmentTablePros {
  columns: Array<Column<any>>;
  data: Array<any>;
  onBoxRemoved: () => void;
}

function ShipmentTable({ columns, data, onBoxRemoved }: IShipmentTablePros) {
  const tableData = useMemo(() => data, [data]);

  const tableInstance = useTable({ columns, data: tableData, useBlockLayout });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const maxTableWidth = useBreakpointValue({ base: "full", md: "100%" });

  // const handleRemoveBox = useCallback(
  //   async (boxId: string) => {
  //     try {
  //       onBoxRemoved();
  //     } catch (error) {
  //       // eslint-disable-next-line no-console
  //       console.error(`Failed to remove box ${boxId}`, error);
  //     }
  //   },
  //   [onBoxRemoved]
  // );

  return (
    <BoxWrapper overflowX="auto" overflowY="hidden">
      <TableContainer maxW={maxTableWidth}>
        <Table {...getTableProps()}>
          <Thead>
            {headerGroups.map((headerGroup) => (
              <Tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <Th {...column.getHeaderProps()}>{column.render("Header")}</Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <Tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <Td {...cell.getCellProps()}>{cell.render("Cell")}</Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </BoxWrapper>
  );
}

export default ShipmentTable;
