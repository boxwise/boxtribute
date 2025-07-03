import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Flex,
  Stack,
  WrapItem,
  Wrap,
  Text,
  SkeletonText,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { IDropdownOption } from "components/Form/SelectField";
import { ShipmentIcon } from "components/Icon/Transfer/ShipmentIcon";
import { BiNetworkChart } from "react-icons/bi";
import { FaDollyFlatbed, FaWarehouse } from "react-icons/fa";
import AssignBoxToShipment from "./AssignBoxToShipment";

import BoxMoveLocation from "./BoxMoveLocation";
import { BoxByLabelIdentifier } from "queries/types";

export interface IBoxTabsProps {
  boxData: BoxByLabelIdentifier;
  boxInTransit: boolean;
  onMoveToLocationClick: (locationId: string) => void;
  onAssignBoxesToShipment: (shipmentId: string) => void;
  onUnassignBoxesToShipment: (shipmentId: string) => void;
  shipmentOptions: IDropdownOption[];
  isLoading: boolean;
}

function BoxTabs({
  boxData,
  boxInTransit,
  onMoveToLocationClick,
  onAssignBoxesToShipment,
  onUnassignBoxesToShipment,
  shipmentOptions,
  isLoading,
}: IBoxTabsProps) {
  const location =
    boxData?.state === "Receiving"
      ? boxData?.shipmentDetail?.sourceLocation
      : boxData?.location;
  return (
    <Box alignContent="center" w="100%">
      <Flex direction="column">
        <Stack direction="column" alignContent="flex-start" p={2}>
          {location && (
            <Stack alignContent="flex-start" spacing={2}>
              <Wrap>
                <WrapItem alignItems="center">
                  <FaWarehouse size={24} />
                </WrapItem>
                <WrapItem alignItems="center">
                  {!isLoading && (
                    <Text as="h4" fontWeight="bold" fontSize={16}>
                      {location?.name}
                    </Text>
                  )}
                  {isLoading && (
                    <SkeletonText width="140px" noOfLines={1}>
                      <Text as="h4" fontWeight="bold" fontSize={16} />
                    </SkeletonText>
                  )}
                </WrapItem>
              </Wrap>
            </Stack>
          )}
          {boxData?.shipmentDetail && (
            <Stack direction="row" alignItems="center" alignContent="center" spacing={2}>
              <ShipmentIcon boxSize={6} alignItems="center" />
              {!isLoading && (
                <Text alignItems="center" alignContent="center">
                  <b>{boxData?.shipmentDetail?.shipment.targetBase.name},</b>{" "}
                  {boxData?.shipmentDetail?.shipment.targetBase.organisation.name}
                </Text>
              )}
              {isLoading && (
                <SkeletonText width="140px" noOfLines={1}>
                  <Text alignItems="center" alignContent="center" />
                </SkeletonText>
              )}
            </Stack>
          )}
        </Stack>
        <Tabs w="100%" isFitted defaultIndex={boxData?.shipmentDetail ? 1 : 0}>
          <TabList>
            <Tab>
              <Stack direction="row" alignContent="center" alignItems="center">
                <FaDollyFlatbed />
                <Text>Move</Text>
              </Stack>
            </Tab>
            {shipmentOptions.length !== 0 && (
              <Tab>
                <Stack direction="row" alignContent="center" alignItems="center">
                  <BiNetworkChart />
                  <Text>Transfer</Text>
                </Stack>
              </Tab>
            )}
          </TabList>
          <TabPanels>
            <TabPanel>
              {boxData?.location !== null && (
                <>
                  {boxData?.state === "MarkedForShipment" && (
                    <Alert status="warning" my={4}>
                      <AlertIcon />
                      MarkedForShipment Boxes are not movable.
                    </Alert>
                  )}
                  <BoxMoveLocation
                    boxData={boxData!}
                    boxInTransit={boxInTransit}
                    onMoveToLocationClick={onMoveToLocationClick}
                    isLoading={isLoading}
                  />
                </>
              )}
            </TabPanel>

            <TabPanel>
              {shipmentOptions.length === 0 && (
                <Text px={4} py={8} alignContent="center">
                  No shipments are being prepared from your base!
                </Text>
              )}
              {shipmentOptions.length > 0 && (
                <AssignBoxToShipment
                  boxData={boxData}
                  isAssignBoxesToShipmentLoading={isLoading}
                  shipmentOptions={shipmentOptions}
                  onAssignBoxesToShipment={onAssignBoxesToShipment}
                  onUnassignBoxesToShipment={onUnassignBoxesToShipment}
                />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </Box>
  );
}

export default BoxTabs;
