import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Text,
  Box,
  Flex,
  Table,
  TableContainer,
  TabList,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  TabPanel,
  Spacer,
  Tab,
  Center,
} from "@chakra-ui/react";
import { ShipmentDetail } from "types/generated/graphql";

export interface IShipmentTabsProps {
  shipmentDetail: ShipmentDetail[];
}
function ShipmentTabs({ shipmentDetail }: IShipmentTabsProps) {
  return (
    <Tabs alignContent="stretch" w="full">
      <TabList>
        <Tab>Content</Tab>
        <Tab>History</Tab>
      </TabList>

      <TabPanels>
        <TabPanel p={0}>
          {(shipmentDetail.length || 0) !== 0 && (
            <Center>No boxes have been assigned to this shipment yet!</Center>
          )}
          {(shipmentDetail?.length || 0) === 0 && (
            <Accordion allowToggle w="full">
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Flex>
                        <Box>
                          <Text>Jacket Mens (20x)</Text>
                        </Box>
                        <Spacer />
                        <Box>
                          <Text>3 boxes</Text>
                        </Box>
                      </Flex>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={2}>
                  <TableContainer>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>BOX #</Th>
                          <Th>PRODUCT</Th>
                          <Th isNumeric>ITEMS</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>132561</Td>
                          <Td>Men Large Jackets</Td>
                          <Td isNumeric>10x</Td>
                        </Tr>
                        <Tr>
                          <Td>578941</Td>
                          <Td>Men Medium Jackets</Td>
                          <Td isNumeric>8X</Td>
                        </Tr>
                        <Tr>
                          <Td>789721</Td>
                          <Td>mMen Small Jackets</Td>
                          <Td isNumeric>4X</Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </TableContainer>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Flex>
                        <Box>
                          <Text>Jackets Unisex Baby (10x)</Text>
                        </Box>
                        <Spacer />
                        <Box>
                          <Text>3 boxes</Text>
                        </Box>
                      </Flex>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={2}>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>BOX #</Th>
                        <Th>PRODUCT</Th>
                        <Th isNumeric>ITEMS</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>132561</Td>
                        <Td>Men Large Jackets</Td>
                        <Td isNumeric>10x</Td>
                      </Tr>
                      <Tr>
                        <Td>578941</Td>
                        <Td>Men Medium Jackets</Td>
                        <Td isNumeric>8X</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )}
        </TabPanel>
        <TabPanel>
          <p>Nothing!</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default ShipmentTabs;
