import { TabList, TabPanels, Tabs, TabPanel, Tab, Center } from "@chakra-ui/react";
import ShipmentHistory, { IGroupedRecordEntry } from "components/Timeline/Timeline";
import _ from "lodash";
import ShipmentContent, { IShipmentContent } from "./ShipmentContent";
import { User } from "../../../../../../graphql/types";
import { Box, ShipmentDetail, ShipmentState } from "queries/types";

export enum ShipmentActionEvent {
  ShipmentStarted = "Shipment Started",
  ShipmentCanceled = "Shipment Canceled",
  ShipmentSent = "Shipment Sent",
  ShipmentStartReceiving = "Shipment Being Received",
  ShipmentCompleted = "Shipment Completed",
  BoxAdded = "Box Added",
  BoxRemoved = "Box Removed",
  BoxLost = "Box Marked Not Delivered",
  BoxReceived = "Box Received",
}

export interface IShipmentHistory {
  box?: string | undefined;
  action: ShipmentActionEvent;
  createdOn: Date;
  createdBy: User;
}

export interface IGroupedHistoryEntry {
  date: string;
  entries: (IShipmentHistory | null | undefined)[];
}

export interface IShipmentTabsProps {
  shipmentState: ShipmentState | undefined;
  details: ShipmentDetail[];
  histories: IGroupedRecordEntry[];
  isLoadingMutation: boolean | undefined;
  showRemoveIcon: Boolean;
  onRemoveBox: (id: string) => void;
  onBulkRemoveBox: (ids: string[]) => void;
}
function ShipmentTabs({
  showRemoveIcon,
  details,
  histories,
  isLoadingMutation,
  onRemoveBox,
  onBulkRemoveBox,
  shipmentState,
}: IShipmentTabsProps) {
  const boxGroupedByProductGender = _.values(
    _(details)
      .groupBy((detail) => `${detail?.sourceProduct?.name}_${detail?.sourceProduct?.gender}`)
      .mapValues((group) => ({
        product: group[0]?.sourceProduct,
        totalItems: _.sumBy(group, (detail) => detail?.sourceQuantity || 0),
        totalBoxes: group.length,
        totalLosts: group.filter((detail) => detail?.lostOn !== null).length,
        boxes: group.map(
          (detail) =>
            ({
              ...detail.box,
              size: group[0]?.sourceSize,
              numberOfItems: detail.sourceQuantity,
              product: group[0]?.sourceProduct,
            }) as Box,
        ),
      }))
      .orderBy((value) => value.totalLosts, "asc")
      .mapKeys(
        (value) =>
          `${value.product?.sizeRange?.label}_${value.product?.gender}_${value.product?.name}_(${value.totalItems}x)_${value.totalBoxes}_Boxes`,
      )
      .value(),
  )! as IShipmentContent[];

  return (
    <Tabs w="100%" isFitted variant="enclosed-colored">
      <TabList>
        <Tab>Content</Tab>
        <Tab>History</Tab>
      </TabList>
      <TabPanels>
        <TabPanel p={0}>
          {(details?.length || 0) === 0 && (
            <Center p={8}>No boxes have been assigned to this shipment yet!</Center>
          )}
          <ShipmentContent
            shipmentState={shipmentState}
            isLoadingMutation={isLoadingMutation}
            items={boxGroupedByProductGender}
            onRemoveBox={onRemoveBox}
            onBulkRemoveBox={onBulkRemoveBox}
            showRemoveIcon={showRemoveIcon}
          />
        </TabPanel>
        <TabPanel>
          <ShipmentHistory records={histories} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default ShipmentTabs;
