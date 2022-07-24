import { useQuery } from "@apollo/client";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Center,
  Box,
  Button,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import {
  DistributionEventsForBaseQuery,
  DistributionEventsForBaseQueryVariables,
} from "types/generated/graphql";
import { DISTRIBUTION_EVENTS_FOR_BASE_ID } from "../queries";
import DistroEventsCalendarContainer from "./components/DistroEventsCalendar/DistroEventsCalendarContainer";
import DistroEventsStatistics from "./components/DistroEventsStatistics";
import APILoadingIndicator from "components/APILoadingIndicator";
import { DistributionEventDetailsSchema } from "../types";

const DistrosDashboardView = () => {
  const baseId = useParams<{ baseId: string }>().baseId;

  const { data, error, loading } = useQuery<
    DistributionEventsForBaseQuery,
    DistributionEventsForBaseQueryVariables
    // TODO: consider to move this into a container (so this view file only extracts the baseId from the url params)
  >(DISTRIBUTION_EVENTS_FOR_BASE_ID, {
    variables: {
      baseId: baseId!,
    },
  });

  if (loading) return <APILoadingIndicator />;
  // TODO: add error logging here
  if (error) return <div>Error: {error.message}</div>

  if (data?.base?.distributionEvents == null) return <div>Error: No data</div>

  console.log("RAW distributionEvents data", data?.base);
  const parsedDistributionEventsData = data?.base?.distributionEvents.map(e => DistributionEventDetailsSchema.parse(e));

  console.log("parsedDistributionEventsData", parsedDistributionEventsData);

  return (
    <Box>
      <Button onClick={() => alert("Not yet implemented")}>
        Create New Distribution Event
      </Button>
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
            <DistroEventsCalendarContainer
              distributionEvents={parsedDistributionEventsData}
              onClickOnDistroEvent={function (distroEventId: string): void {
                throw new Error("Function not implemented.");
              }}
            />
          </TabPanel>
          <TabPanel>
            <DistroEventsStatistics />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default DistrosDashboardView;
