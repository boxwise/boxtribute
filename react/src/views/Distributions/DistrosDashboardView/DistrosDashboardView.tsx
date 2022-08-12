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
  ModalOverlay, Tab, TabList, TabPanel, TabPanels, Tabs, useDisclosure
} from "@chakra-ui/react";
import APILoadingIndicator from "components/APILoadingIndicator";
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DistributionEventsForBaseQuery,
  DistributionEventsForBaseQueryVariables
} from "types/generated/graphql";
import { z } from "zod";
import { DISTRIBUTION_EVENTS_FOR_BASE_ID } from "../queries";
import { DistributionEventDetails, DistributionEventDetailsSchema } from "../types";
import DistroEventsCalendarContainer from "./components/DistroEventsCalendar/DistroEventsCalendarContainer";
import DistroEventsStatistics from "./components/DistroEventsStatistics";
import UpcomingDistributions from "./components/UpcomingDistributions";

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

  const navigate = useNavigate();


  const onGoToDistroEventViewHandler = useCallback(
    (distroEventId: string) =>
      navigate(`/bases/${baseId}/distributions/events/${distroEventId}`),
    [baseId, navigate]
  );


  const calendarEventDetailsModalState = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState<DistributionEventDetails | undefined>()



  if (loading) return <APILoadingIndicator />;
  // TODO: add error logging here
  if (error) return <div>Error: {error.message}</div>;

  if (data?.base?.distributionEvents == null) return <div>Error: No data</div>;

  const parsedDistributionEventsData = z
    .array(DistributionEventDetailsSchema)
    .parse(data?.base?.distributionEvents);

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
            <UpcomingDistributions distributionEventsData={parsedDistributionEventsData} />
          </TabPanel>
          <TabPanel>
            {selectedEvent &&
            <Modal isOpen={calendarEventDetailsModalState.isOpen} onClose={calendarEventDetailsModalState.onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader><>{selectedEvent.distributionSpot.name} - {(new Date(selectedEvent.plannedStartDateTime)).toLocaleDateString('en-US')}</></ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box>Spot: {selectedEvent.distributionSpot.name}</Box>
                    <Box>State: {selectedEvent.state}</Box>
                </ModalBody>

                <ModalFooter>
                  <Button colorScheme="blue" mr={3} onClick={calendarEventDetailsModalState.onClose}>
                    Close
                  </Button>
                  <Button variant="ghost" onClick={() => onGoToDistroEventViewHandler(selectedEvent.id)}>Go to Event Details</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          }

            <DistroEventsCalendarContainer
              distributionEvents={parsedDistributionEventsData}
              onClickOnDistroEvent={function (distroEventId: string): void {
                setSelectedEvent(parsedDistributionEventsData.find(distroEvent => distroEvent.id === distroEventId))
                calendarEventDetailsModalState.onOpen()
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
