import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useSortBy, useTable } from "react-table";

function TransferAgreementTable({ columns, tableData }) {
  const { headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data: tableData,
    },
    useSortBy,
  );

  return (
    <Table>
      <Thead>
        {headerGroups.map((headerGroup) => (
          <Tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <Th
                {...column.getHeaderProps(column.getSortByToggleProps())}
                title={`Toggle SortBy for '${column.render("Header")}'`}
              >
                {column.render("Header")}
                {/* <chakra.span pl="4">
                  {column.isSorted ? (
                    column.isSortedDesc ? (
                      <TriangleDownIcon aria-label="sorted descending" />
                    ) : (
                      <TriangleUpIcon aria-label="sorted ascending" />
                    )
                  ) : null}
                </chakra.span> */}
              </Th>
            ))}
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <Tr {...row.getRowProps()}>
              {row.cells.map((cell) => (
                <Td>{cell.render("Cell")}</Td>
              ))}
            </Tr>
          );
        })}
        <Accordion allowToggle>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Columns
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Flex flexWrap="wrap">test</Flex>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Tbody>
    </Table>
  );
}

export default TransferAgreementTable;
