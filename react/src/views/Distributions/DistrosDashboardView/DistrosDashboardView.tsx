import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import { useCallback } from "react";
import { useGlobalSiteState } from "utils/hooks";
import DistrosDashboardContainer from "./components/DistrosDashboardContainer";

const DistrosDashboardView = () => {
  //   const { currentBaseId, navigate } = useGlobalSiteState();

  return (
    <Tabs>
      <TabList>
        <Tab>Distributions</Tab>
        <Tab>Calendar View</Tab>
        <Tab>Statistics</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <p>Upcoming Distributions</p>
        </TabPanel>
        <TabPanel>
        <DistrosDashboardContainer />
        </TabPanel>
        <TabPanel>
          <p>three!</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default DistrosDashboardView;
