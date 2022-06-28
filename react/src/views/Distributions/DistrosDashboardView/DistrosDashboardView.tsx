import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import DistroEventsStatistics from "./components/DistroEventsStatistics";
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
        <DistroEventsStatistics />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default DistrosDashboardView;
