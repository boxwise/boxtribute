import { TabList, TabPanels, Tabs, TabPanel, Tab, Center } from "@chakra-ui/react";
import _ from "lodash";
import { Box, ShipmentDetail } from "types/generated/graphql";
import ShipmentContent, { IShipmentContent } from "./ShipmentContent";
import ShipmentHistory from "./ShipmentHistory";

export interface IShipmentTabsProps {
  shipmentDetail: ShipmentDetail[];
}
function ShipmentTabs({ shipmentDetail }: IShipmentTabsProps) {
  const boxGroupedByProductGender = _.values(
    _(shipmentDetail)
      .groupBy((shipment) => `${shipment?.box?.product?.name}_${shipment?.box?.product?.gender}`)
      .mapValues((group) => ({
        product: group[0]?.box?.product,
        totalItems: _.sumBy(group, (shipment) => shipment?.box?.numberOfItems || 0),
        totalBoxes: group.length,
        boxes: group.map((shipment) => shipment.box as Box),
      }))
      .mapKeys(
        (value) =>
          // eslint-disable-next-line max-len
          `${value.product?.sizeRange?.label}_${value.product?.gender}_${value.product?.name}_(${value.totalItems}x)_${value.totalBoxes}_Boxes`,
      )
      .value(),
  ) as unknown as IShipmentContent[];

  return (
    <Tabs w="100%" isFitted variant="enclosed-colored">
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
            <ShipmentContent items={boxGroupedByProductGender} onBoxRemoved={() => {}} />
          )}
        </TabPanel>
        <TabPanel>
          <ShipmentHistory />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default ShipmentTabs;
