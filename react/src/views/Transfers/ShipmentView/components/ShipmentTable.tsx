import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { Box } from "types/generated/graphql";

interface IShipmentTablePros {
  boxes: Box[];
}

function ShipmentTable({ boxes }: IShipmentTablePros) {
  return (
    <TableContainer>
      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th>BOX #</Th>
            <Th>PRODUCT</Th>
            <Th isNumeric>ITEMS</Th>
          </Tr>
        </Thead>
        <Tbody>
          {boxes.map((box) => (
            <Tr key={box.id}>
              <Td>{box.labelIdentifier}</Td>
              <Td>
                {box.product?.sizeRange?.label} {box.product?.gender} {box.product?.name}
              </Td>
              <Td isNumeric>{box.numberOfItems}x</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export default ShipmentTable;
