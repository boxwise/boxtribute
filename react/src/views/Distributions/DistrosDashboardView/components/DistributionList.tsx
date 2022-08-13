import {
  Box,
  Center,
  Heading,
  LinkBox,
  LinkOverlay,
  List,
  ListItem,
  SimpleGrid,
  Text,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { isToday } from "date-fns";
import isFuture from "date-fns/isFuture";
import isPast from "date-fns/isPast";
import _ from "lodash";
import { ReactElement } from "react";
import { useParams } from "react-router-dom";
import { useGetUrlForResourceHelpers } from "utils/hooks";
import {
  DistributionEventDetails,
  DistributionEventState,
} from "views/Distributions/types";

const ListOfEvents = ({
  distributionEventsListData,
}: {
  distributionEventsListData: DistributionEventDetails[];
}) => {
  const { getDistroEventDetailUrlById } = useGetUrlForResourceHelpers();

  return (
      <List>
      {distributionEventsListData.map((distributionEventData) => (
        <ListItem my={5}><LinkBox maxW="sm" p="5" borderWidth="1px" rounded="md">
          <Box
            as="time"
            dateTime={distributionEventData.plannedStartDateTime.toUTCString()}
          >
            {distributionEventData.plannedStartDateTime.toDateString()} (
            {distributionEventData.plannedStartDateTime.toLocaleTimeString()} -{" "}
            {distributionEventData.plannedEndDateTime.toLocaleTimeString()})
          </Box>
          <Heading size="md" my="2">
            <LinkOverlay
              href={getDistroEventDetailUrlById(distributionEventData.id)}
            >
              {distributionEventData.distributionSpot.name}{" "}
              {!!distributionEventData.name && (
                <>({distributionEventData.name})</>
              )}
            </LinkOverlay>
          </Heading>

          <Text>
            <b>State: </b>
            {distributionEventData.state}
          </Text>
        </LinkBox>
        </ListItem>
      ))}
    </List>
  );
};

const DistributionList = ({
  distributionEventsData,
}: {
  distributionEventsData: DistributionEventDetails[];
}) => {
  const sortedDistroEvents = _.chain(distributionEventsData)
    .orderBy((el) => el.plannedStartDateTime, "desc")
    .value();

  const distroEventsToday = sortedDistroEvents.filter((el) =>
    isToday(el.plannedStartDateTime)
  );
  const upcomingDistroEventsAfterToday = sortedDistroEvents.filter(
    (el) =>
      isFuture(el.plannedStartDateTime) && !isToday(el.plannedStartDateTime)
  );

  const pastDistroEvents = sortedDistroEvents.filter((el) =>
    isPast(el.plannedStartDateTime)
  );
  const pastNonCompletedDistroEvents = pastDistroEvents.filter(
    (el) => el.state !== DistributionEventState.Completed
  );
  const pastCompletedDistroEvents = sortedDistroEvents.filter(
    (el) => el.state === DistributionEventState.Completed
  );

  const hasDistroEventsToday = distroEventsToday.length > 0;
  const hasUpcomingDistroEventsAfterToday =
    upcomingDistroEventsAfterToday.length > 0;
  const showHeadingForUpcomingDistroEventsAfterTodaySection =
    hasDistroEventsToday;

  const hasPastDistroEvents = pastDistroEvents.length > 0;
  const hasPastCompletedDistroEvents = pastCompletedDistroEvents.length > 0;
  const hasPastNonCompletedDistroEvents =
    pastNonCompletedDistroEvents.length > 0;

  return (
    <VStack>
      {hasDistroEventsToday && (
        <>
          <Heading as="h4" py={10}>Today</Heading>
          <ListOfEvents distributionEventsListData={distroEventsToday} />
        </>
      )}
      {hasUpcomingDistroEventsAfterToday && (
        <>
          {showHeadingForUpcomingDistroEventsAfterTodaySection && (
            <Heading as="h4" py={10}>Upcoming</Heading>
          )}
          <ListOfEvents
            distributionEventsListData={upcomingDistroEventsAfterToday}
          />
        </>
      )}

      {hasPastDistroEvents && (
        <>
          <Heading as="h4" pt={10}>Past</Heading>
          {hasPastNonCompletedDistroEvents && (
            <>
              <Heading as="h5" size={"md"} pt={4}>
                To be completed
              </Heading>
              <ListOfEvents
                distributionEventsListData={pastNonCompletedDistroEvents}
              />
            </>
          )}
          {hasPastCompletedDistroEvents && (
            <>
              <Heading as="h5" size={"md"} pt={4}>
                Completed
              </Heading>
              <ListOfEvents
                distributionEventsListData={pastCompletedDistroEvents}
              />
            </>
          )}
        </>
      )}
    </VStack>
  );
};

export default DistributionList;
