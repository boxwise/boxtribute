import { TabList, TabPanels, Tabs, TabPanel, Tab, Center } from "@chakra-ui/react";
import { ShipmentDetail } from "types/generated/graphql";
import ShipmentContent from "./ShipmentContent";

export interface IShipmentTabsProps {
  shipmentDetail: ShipmentDetail[];
}
function ShipmentTabs({ shipmentDetail }: IShipmentTabsProps) {
  return (
    <Tabs w="100%" isFitted>
      <TabList>
        <Tab>Content</Tab>
        <Tab>History</Tab>
      </TabList>

      <TabPanels>
        <TabPanel p={0}>
          {(shipmentDetail.length || 0) !== 0 && (
            <Center>No boxes have been assigned to this shipment yet!</Center>
          )}
          {(shipmentDetail?.length || 0) === 0 && <ShipmentContent />}
        </TabPanel>
        <TabPanel>
          <p>Nothing!</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default ShipmentTabs;
