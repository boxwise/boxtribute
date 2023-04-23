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
} from "@chakra-ui/react";
import { IDropdownOption } from "components/Form/SelectField";
import { ShipmentIcon } from "components/Icon/Transfer/ShipmentIcon";
import {
  IAssignBoxToShipmentResult,
  IUnassignBoxToShipmentResult,
} from "hooks/useAssignBoxesToShipment";
import { BiNetworkChart } from "react-icons/bi";
import { FaDollyFlatbed, FaWarehouse } from "react-icons/fa";
import { BoxByLabelIdentifierQuery } from "types/generated/graphql";
import AssignBoxToShipment from "./AssignBoxToShipment";

import BoxMoveLocation from "./BoxMoveLocation";

export interface IBoxTabsProps {
  boxData: BoxByLabelIdentifierQuery["box"];
  onMoveToLocationClick: (locationId: string) => void;
  onAssignBoxesToShipment: (shipmentId: string) => Promise<IAssignBoxToShipmentResult>;
  onUnassignBoxesToShipment: (shipmentId: string) => Promise<IUnassignBoxToShipmentResult>;
  shipmentOptions: IDropdownOption[];
  isLoading: boolean;
}

function BoxTabs({
  boxData,
  onMoveToLocationClick,
  onAssignBoxesToShipment,
  onUnassignBoxesToShipment,
  shipmentOptions,
  isLoading,
}: IBoxTabsProps) {
  return (
    <Box
      alignContent="center"
      w={["100%", "80%", "30%", "30%"]}
      mr={["0", "0", "4rem", "4rem"]}
      mb={6}
    >
      <Flex direction="column">
        <Stack direction="column" alignContent="flex-start" p={2}>
          <Stack alignContent="flex-start" spacing={2}>
            <Wrap>
              <WrapItem alignItems="center">
                <FaWarehouse size={24} />
              </WrapItem>
              <WrapItem alignItems="center">
                <Text fontWeight="bold" fontSize={16}>
                  {boxData?.location?.name}
                </Text>
              </WrapItem>
            </Wrap>
          </Stack>
          {boxData?.shipmentDetail && (
            <Stack direction="row" alignItems="center" alignContent="center" spacing={2}>
              <ShipmentIcon boxSize={6} alignItems="center" />
              <Text alignItems="center" alignContent="center">
                <b>{boxData?.shipmentDetail?.shipment.targetBase.name},</b>{" "}
                {boxData?.shipmentDetail?.shipment.targetBase.organisation.name}
              </Text>
            </Stack>
          )}
        </Stack>
        <Tabs w="100%" isFitted variant="enclosed-colored">
          <TabList>
            <Tab>
              <Stack direction="row" alignContent="center" alignItems="center">
                <FaDollyFlatbed />
                <Text>Move</Text>
              </Stack>
            </Tab>
            <Tab>
              <Stack direction="row" alignContent="center" alignItems="center">
                <BiNetworkChart />
                <Text>Transfer</Text>
              </Stack>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={4}>
              <BoxMoveLocation
                boxData={boxData}
                onMoveToLocationClick={onMoveToLocationClick}
                isLoading={isLoading}
              />
            </TabPanel>
            <TabPanel>
              {shipmentOptions.length === 0 && (
                <Text px={4} py={8} alignContent="center">
                  No shipments are being prepared from your base!
                </Text>
              )}
              {shipmentOptions.length > 0 && (
                <AssignBoxToShipment
                  currentShipmentId={boxData?.shipmentDetail?.shipment?.id}
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
