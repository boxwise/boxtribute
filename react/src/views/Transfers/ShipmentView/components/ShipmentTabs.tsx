import { TabList, TabPanels, Tabs, TabPanel, Tab, Center } from "@chakra-ui/react";
import _ from "lodash";
import { Box, HistoryEntry, ShipmentDetail } from "types/generated/graphql";
import ShipmentContent, { IShipmentContent } from "./ShipmentContent";
import ShipmentHistory from "./ShipmentHistory";

export interface IBoxHistoryEntry extends HistoryEntry {
  labelIdentifier: string;
}

export interface IGroupedHistoryEntry {
  date: string;
  entries: (ShipmentDetail | null | undefined)[];
}

export interface IShipmentTabsProps {
  detail: ShipmentDetail[];
  histories: IGroupedHistoryEntry[];
  showRemoveIcon: Boolean;
  onRemoveBox: (id: string) => void;
  onBulkRemoveBox: (ids: string[]) => void;
}
function ShipmentTabs({
  showRemoveIcon,
  detail,
  histories,
  onRemoveBox,
  onBulkRemoveBox,
}: IShipmentTabsProps) {
  const boxGroupedByProductGender = _.values(
    _(detail)
      .groupBy(
        (shipment) =>
          `${shipment?.box?.product?.name || shipment?.sourceProduct?.name}_${
            shipment?.box?.product?.gender || shipment?.sourceProduct?.gender
          }`,
      )
      .mapValues((group) => ({
        product: group[0]?.box?.product ? group[0]?.box?.product : group[0]?.sourceProduct,
        totalItems: _.sumBy(group, (shipment) => shipment?.box?.numberOfItems || 0),
        totalBoxes: group.length,
        boxes: group.map(
          (shipment) =>
            ({
              ...shipment.box,
              product: shipment?.box?.product ?? group[0]?.sourceProduct,
            } as Box),
        ),
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
          {(detail?.length || 0) === 0 && (
            <Center p={8}>No boxes have been assigned to this shipment yet!</Center>
          )}
          {(detail?.length || 0) !== 0 && (
            <ShipmentContent
              items={boxGroupedByProductGender}
              onRemoveBox={onRemoveBox}
              onBulkRemoveBox={onBulkRemoveBox}
              showRemoveIcon={showRemoveIcon}
            />
          )}
        </TabPanel>
        <TabPanel>
          <ShipmentHistory histories={histories} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default ShipmentTabs;
