import { useQuery } from "@apollo/client";
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  DistributionEventsForBaseQuery,
  DistributionEventsForBaseQueryVariables,
} from "types/generated/graphql";
import { z } from "zod";
import { DISTRIBUTION_EVENTS_FOR_BASE_ID } from "../queries";
import {
  DistributionEventDetails,
  DistributionEventDetailsSchema,
} from "../types";
import DistroEventsCalendarContainer from "./components/DistroEventsCalendar/DistroEventsCalendarContainer";
import DistroEventsStatistics from "./components/DistroEventsStatistics";
import DistributionList from "./components/DistributionList";
import DistributionListForReturnTracking from "./components/DistributionListForReturnTracking";

const DistrosDashboardView = () => {
  const baseId = useParams<{ baseId: string }>().baseId;

  const navigate = useNavigate();
  // TODO: consider to extract this out into custom hook (if it really makes sense!)
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const tabIndexSearchParam = searchParams.get("tab");
  const tabIndexSearchParamAsNumber = parseInt(tabIndexSearchParam || "0");
  // searchParams.get("tab") && setCurrentTabIndex(parseInt(searchParams.get("tab")!));

  // TODO: consider to flip the sync logic for the tab index search param:
  // instead of setting the search url param and then register on changes on it,
  // set the tab index and then sync the url search param based on it.
  // Also then set the initial state value of currentTabIndex based on the search param.
  // This way, even in (unlikely) cases of incompatible browsers etc, the switching of the tab
  // will be supported via the UI.
  useEffect(() => {
    if (tabIndexSearchParamAsNumber !== currentTabIndex) {
      setCurrentTabIndex(tabIndexSearchParamAsNumber!);
    }
  }, [currentTabIndex, tabIndexSearchParamAsNumber]);

  const { data, error, loading } = useQuery<
    DistributionEventsForBaseQuery,
    DistributionEventsForBaseQueryVariables
    // TODO: consider to move this into a container (so this view file only extracts the baseId from the url params)
  >(DISTRIBUTION_EVENTS_FOR_BASE_ID, {
    variables: {
      baseId: baseId!,
    },
  });

  const onGoToDistroEventViewHandler = useCallback(
    (distroEventId: string) =>
      navigate(`/bases/${baseId}/distributions/events/${distroEventId}`),
    [baseId, navigate]
  );

  const calendarEventDetailsModalState = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState<
    DistributionEventDetails | undefined
  >();

  if (loading) return <APILoadingIndicator />;
  // TODO: add error logging here
  if (error) return <div>Error: {error.message}</div>;

  if (data?.base?.distributionEvents == null) return <div>Error: No data</div>;

  const parsedDistributionEventsData = z
    .array(DistributionEventDetailsSchema)
    .parse(data?.base?.distributionEvents);

  return (
    <Box>
      <Tabs
        index={currentTabIndex}
        onChange={(param) => setSearchParams({ tab: param.toString() })}
      >
        <TabList>
          <Tab>Distributions</Tab>
          <Tab>Track Returns</Tab>
          <Tab>Calendar View</Tab>
          <Tab>Statistics</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <DistributionList
              distributionEventsData={parsedDistributionEventsData}
            />
          </TabPanel>
          <TabPanel>
            <DistributionListForReturnTracking
              distributionEventsData={parsedDistributionEventsData}
            />
          </TabPanel>
          <TabPanel>
            {selectedEvent && (
              <Modal
                isOpen={calendarEventDetailsModalState.isOpen}
                onClose={calendarEventDetailsModalState.onClose}
              >
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>
                    <>
                      {selectedEvent.distributionSpot.name} -{" "}
                      {new Date(
                        selectedEvent.plannedStartDateTime
                      ).toLocaleDateString("en-US")}
                    </>
                  </ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <Box>Spot: {selectedEvent.distributionSpot.name}</Box>
                    <Box>State: {selectedEvent.state}</Box>
                  </ModalBody>

                  <ModalFooter>
                    <Button
                      colorScheme="blue"
                      mr={3}
                      onClick={calendarEventDetailsModalState.onClose}
                    >
                      Close
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        onGoToDistroEventViewHandler(selectedEvent.id)
                      }
                    >
                      Go to Event Details
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            )}

            <DistroEventsCalendarContainer
              distributionEvents={parsedDistributionEventsData}
              onClickOnDistroEvent={function (distroEventId: string): void {
                setSelectedEvent(
                  parsedDistributionEventsData.find(
                    (distroEvent) => distroEvent.id === distroEventId
                  )
                );
                calendarEventDetailsModalState.onOpen();
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
