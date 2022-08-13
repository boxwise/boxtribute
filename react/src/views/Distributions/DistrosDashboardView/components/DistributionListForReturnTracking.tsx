import { BellIcon } from "@chakra-ui/icons";
import {
  Box,
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
        <ListItem my={5}>
          <LinkBox maxW="sm" p="5" borderWidth="1px" rounded="md">
            <Box
              as="time"
              dateTime={distributionEventData.plannedStartDateTime.toUTCString()}
            >
              {distributionEventData.plannedStartDateTime.toDateString()} (
              {distributionEventData.plannedStartDateTime.toLocaleTimeString()}{" "}
              - {distributionEventData.plannedEndDateTime.toLocaleTimeString()})
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

const DistributionListForReturnTracking = ({
  distributionEventsData,
}: {
  distributionEventsData: DistributionEventDetails[];
}) => {
  const sortedDistroEventsWhichNeedReturnTracking = _.chain(
    distributionEventsData
  )
    .filter((el) => el.state === DistributionEventState.Returned)
    .orderBy((el) => el.plannedStartDateTime, "desc")
    .value();

  const numberOfPastDistroEventsNotInReturnStateNorCompleted = _.chain(
    distributionEventsData
  )
    .filter(
      (el) =>
        isPast(el.plannedEndDateTime) &&
        ![
          DistributionEventState.Completed,
          DistributionEventState.Returned,
        ].includes(el.state)
    )
    .value();

  const showMessageAboutPastEventsNotYetInReturnState =
    numberOfPastDistroEventsNotInReturnStateNorCompleted.length > 0;

  // const sortedD

  return (
    <VStack>
      <Heading as="h2" py={10} size="lg" textAlign="center">
        Distribution Events: Returned Items Tracking
      </Heading>
      {showMessageAboutPastEventsNotYetInReturnState && (
        <Text backgroundColor="orange.100" textAlign="center">
          <BellIcon /> You still have past events which are not yet in the "Returned" state.
          <br />In the "Distributions" Tab, you can change their state. <br />Only then they will be listed here.
        </Text>
      )}
      {/* <ListOfEvents distributionEventsListData={distroEventsToday} /> */}
    </VStack>
  );
};

export default DistributionListForReturnTracking;
