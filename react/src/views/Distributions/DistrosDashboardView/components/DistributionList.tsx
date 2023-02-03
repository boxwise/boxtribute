import {
  Box,
  Button,
  Heading,
  LinkBox,
  LinkOverlay,
  List,
  ListItem,
  Text,
  VStack,
} from "@chakra-ui/react";
import { isToday } from "date-fns";
import isFuture from "date-fns/isFuture";
import isPast from "date-fns/isPast";
import _ from "lodash";
import { NavLink } from "react-router-dom";
import { DistributionEventState } from "types/generated/graphql";
import { useGetUrlForResourceHelpers } from "hooks/hooks";
import DistributionEventTimeRangeDisplay from "views/Distributions/components/DistributionEventTimeRangeDisplay";
import { DistributionEventDetails } from "views/Distributions/types";

const ListOfEvents = ({
  distributionEventsListData,
}: {
  distributionEventsListData: DistributionEventDetails[];
}) => {
  const { getDistroEventDetailUrlById } = useGetUrlForResourceHelpers();

  return (
    <List>
      {distributionEventsListData.map((distributionEventData) => (
        <ListItem key={distributionEventData.id} my={5}>
          <LinkBox maxW="sm" p="5" borderWidth="1px" rounded="md">
            <Box
              as="time"
              dateTime={distributionEventData.plannedStartDateTime.toUTCString()}
            >
              <DistributionEventTimeRangeDisplay
                plannedStartDateTime={
                  distributionEventData.plannedStartDateTime
                }
                plannedEndDateTime={distributionEventData.plannedEndDateTime}
              />
            </Box>

            <Heading size="md" my="2">
              <LinkOverlay
                to={getDistroEventDetailUrlById(distributionEventData.id)}
                as={NavLink}
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

interface DistributionListProps {
  onNewDirectDistroEvent: () => void;
  distributionEventsData: DistributionEventDetails[];
}

const DistributionList = ({
  distributionEventsData,
  onNewDirectDistroEvent,
}: DistributionListProps) => {
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

  const pastDistroEvents = sortedDistroEvents.filter(
    (el) => isPast(el.plannedStartDateTime) && !isToday(el.plannedStartDateTime)
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
      <Button onClick={onNewDirectDistroEvent}>New Distribution Event</Button>
      {hasDistroEventsToday && (
        <>
          <Heading as="h4" py={7}>
            Today
          </Heading>
          <ListOfEvents distributionEventsListData={distroEventsToday} />
        </>
      )}
      {hasUpcomingDistroEventsAfterToday && (
        <>
          {showHeadingForUpcomingDistroEventsAfterTodaySection && (
            <Heading as="h4" py={10}>
              Upcoming
            </Heading>
          )}
          <ListOfEvents
            distributionEventsListData={upcomingDistroEventsAfterToday}
          />
        </>
      )}

      {hasPastDistroEvents && (
        <>
          <Heading as="h4" pt={7}>
            Past
          </Heading>
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
