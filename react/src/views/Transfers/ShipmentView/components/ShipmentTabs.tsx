import { TabList, TabPanels, Tabs, TabPanel, Tab, Center } from "@chakra-ui/react";
import _ from "lodash";
import { Box, ShipmentDetail, ShipmentState, User } from "types/generated/graphql";
import ShipmentContent, { IShipmentContent } from "./ShipmentContent";
import ShipmentHistory from "./ShipmentHistory";

// eslint-disable-next-line no-shadow
export enum ShipmentActionEvent {
  ShipmentStarted = "Shipment Started",
  ShipmentCanceled = "Shipment Canceled",
  ShipmentSent = "Shipment Sent",
  ShipmentStartReceiving = "Shipment BeingReceived",
  ShipmentCompleted = "Shipment Completed",
  BoxAdded = "Box Added",
  BoxRemoved = "Box Removed",
  BoxLost = "Box Lost",
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
  detail: ShipmentDetail[];
  histories: IGroupedHistoryEntry[];
  isLoadingMutation: boolean | undefined;
  showRemoveIcon: Boolean;
  onRemoveBox: (id: string) => void;
  onBulkRemoveBox: (ids: string[]) => void;
}
function ShipmentTabs({
  showRemoveIcon,
  detail,
  histories,
  isLoadingMutation,
  onRemoveBox,
  onBulkRemoveBox,
  shipmentState,
}: IShipmentTabsProps) {
  const boxGroupedByProductGender = _.values(
    _(detail)
      .groupBy((shipment) => `${shipment?.sourceProduct?.name}_${shipment?.sourceProduct?.gender}`)
      .mapValues((group) => ({
        product: group[0]?.sourceProduct,
        totalItems: _.sumBy(group, (shipment) => shipment?.sourceQuantity || 0),
        totalBoxes: group.length,
        boxes: group.map(
          (shipment) =>
            ({
              ...shipment.box,
              size: group[0]?.sourceSize,
              numberOfItems: group[0]?.sourceQuantity,
              product: group[0]?.sourceProduct,
            } as Box),
        ),
      }))
      .mapKeys(
        (value) =>
          // eslint-disable-next-line max-len
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
          {(detail?.length || 0) === 0 && (
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
          <ShipmentHistory histories={histories} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default ShipmentTabs;
