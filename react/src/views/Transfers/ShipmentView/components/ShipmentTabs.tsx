import { TabList, TabPanels, Tabs, TabPanel, Tab, Center } from "@chakra-ui/react";
import _ from "lodash";
import { ShipmentDetail } from "types/generated/graphql";
import ShipmentContent, { IShipmentContent } from "./ShipmentContent";

export interface IShipmentTabsProps {
  shipmentDetail: ShipmentDetail[];
}
function ShipmentTabs({ shipmentDetail }: IShipmentTabsProps) {
  const boxGroupedByProductGender = _.values(
    _(shipmentDetail)
      .groupBy(
        (shipment) => `${shipment?.box?.product?.category.name}_${shipment?.box?.product?.gender}`,
      )
      .mapValues((group) => ({
        category: group[0]?.box?.product?.category.name,
        gender: group[0]?.box?.product?.gender,
        totalItems: _.sumBy(group, (shipment) => shipment?.box?.numberOfItems || 0),
        totalBoxes: group.length,
        boxes: group.map((shipment) => shipment.box),
      }))
      .mapKeys(
        // eslint-disable-next-line max-len
        (value) =>
          `${value.category}_${value.gender}_(${value.totalItems}x)_${value.totalBoxes}_Boxes`,
      )
      .value(),
  ) as unknown as IShipmentContent[];

  return (
    <Tabs w="100%" isFitted>
      <TabList>
        <Tab>Content</Tab>
        <Tab>History</Tab>
      </TabList>
      <TabPanels>
        <TabPanel p={0}>
          {(shipmentDetail.length || 0) === 0 && (
            <Center>No boxes have been assigned to this shipment yet!</Center>
          )}
          {(shipmentDetail?.length || 0) !== 0 && (
            <ShipmentContent items={boxGroupedByProductGender} />
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
