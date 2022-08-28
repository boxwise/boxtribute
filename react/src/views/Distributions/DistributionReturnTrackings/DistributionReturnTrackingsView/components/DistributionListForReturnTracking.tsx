import { useApolloClient } from "@apollo/client";
import { BellIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Checkbox,
  Heading,
  Link,
  List,
  ListItem,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { getDay, parseISO } from "date-fns";
import isPast from "date-fns/isPast";
import _ from "lodash";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DistributionEventState,
  StartDistributionEventsTrackingGroupMutation,
  StartDistributionEventsTrackingGroupMutationVariables,
} from "types/generated/graphql";
import {
  getDateNormalizedDateTime,
  weekDayNumberToWeekDayName,
} from "utils/helpers";
import { START_DISTRIBUTION_EVENTS_TRACKING_GROUP_MUTATION } from "views/Distributions/queries";
import { DistributionEventDetails, DistributionTrackingGroup } from "views/Distributions/types";

interface CheckboxGroupProps {
  groupName: string;
  allValuesWithLabels: [string, string][];
  selectedValues: string[];
  onChange: (selectedValues: string[], unselectedValues: string[]) => void;
}
function CheckboxGroup({
  groupName,
  allValuesWithLabels,
  selectedValues,
  onChange,
}: CheckboxGroupProps) {
  const allChecked = selectedValues.length === allValuesWithLabels.length;
  const isIndeterminate = selectedValues.some(Boolean) && !allChecked;
  const allValues = allValuesWithLabels.map((el) => el[0]);

  return (
    <>
      <Checkbox
        isChecked={allChecked}
        isIndeterminate={isIndeterminate}
        onChange={(e) =>
          e.target.checked ? onChange(allValues, []) : onChange([], allValues)
        }
      >
        {groupName}
      </Checkbox>
      <Stack pl={6} mt={1} spacing={1}>
        {allValuesWithLabels.map(([value, label]) => (
          <Checkbox
            key={value}
            isChecked={selectedValues.some((el) => el === value)}
            onChange={(e) =>
              e.target.checked ? onChange([value], []) : onChange([], [value])
            }
          >
            {label}
          </Checkbox>
        ))}
      </Stack>
    </>
  );
}

const DistributionListForReturnTracking = ({
  distributionEventsData,
  returnTrackingGroups
}: {
  distributionEventsData: DistributionEventDetails[];
  returnTrackingGroups: DistributionTrackingGroup[];
}) => {
  const navigate = useNavigate();
  const baseId = useParams<{ baseId: string }>().baseId!;

  const sortedDistroEventsWhichNeedReturnTracking = _.chain(
    distributionEventsData
  )
    .filter(
      (el) => el.state === DistributionEventState.ReturnedFromDistribution
    )
    .orderBy((el) => el.plannedStartDateTime, "desc")
    .value();

  const pastDistroEventsNotInReturnStateNorCompleted = _.chain(
    distributionEventsData
  )
    .filter(
      (el) =>
        isPast(el.plannedEndDateTime) &&
        ![
          DistributionEventState.Completed,
          DistributionEventState.ReturnedFromDistribution,
        ].includes(el.state)
    )
    .value();

  const showMessageAboutPastEventsNotYetInReturnState =
    pastDistroEventsNotInReturnStateNorCompleted.length > 0;

  const distroEventsToShowGroupedByDay = _.chain(
    sortedDistroEventsWhichNeedReturnTracking
  )
    .groupBy((el) =>
      getDateNormalizedDateTime(el.plannedStartDateTime).toISOString()
    )
    .map((events, date) => ({ date: parseISO(date), events }))
    .value();

  // TODO: name the following const better/more specific
  // Or consider to move them together with the jsx/template code below
  // into a dedicated component
  // const allValues = sortedDistroEventsWhichNeedReturnTracking.map(
  //   (el) => el.id
  // );
  const [selectedValues, setSelectedValues] = useState([] as string[]);

  // const [
  //   startDistributionEventsTrackingGroupMutation,
  //   startDistributionEventsTrackingGroupMutationStatus,
  // ] = useMutation<
  //   StartDistributionEventsTrackingGroupMutation,
  //   StartDistributionEventsTrackingGroupMutationVariables
  // >(START_DISTRIBUTION_EVENTS_TRACKING_GROUP_MUTATION, {
  //   // refetchQueries: [refetchBoxByLabelIdentifierQueryConfig(labelIdentifier)],
  // });

  const apolloClient = useApolloClient();

  const onStartReturnTrackingClick = () => {
    apolloClient
      .query<
        StartDistributionEventsTrackingGroupMutation,
        StartDistributionEventsTrackingGroupMutationVariables
      >({
        query: START_DISTRIBUTION_EVENTS_TRACKING_GROUP_MUTATION,
        variables: {
          baseId,
          distributionEventIds: selectedValues,
          // returnedToLocationId: null,
        },
        fetchPolicy: "no-cache",
      })
      .then(({ data, error, errors }) => {
        navigate({
          pathname: `/bases/${baseId}/distributions/return-trackings/${data.startDistributionEventsTrackingGroup?.id}`,
        });
      });
    // navigate({
    //   pathname: `/bases/${baseId}/distributions/return-tracking`,
    //   search: `?distroEventIds[]=${selectedValues.join("&distroEventIds[]=")}`,
    // });
    // call mutation to start return tracking with all event ids
    // navigate to the return tracking view of the newly created return tracking
  };

  // if(startDistributionEventsTrackingGroupMutationStatus.error) {
  //   return <>Error</>
  // }

  // if(startDistributionEventsTrackingGroupMutationStatus.loading) {
  //   return <APILoadingIndicator />
  // }

  return (
    <VStack>
      <VStack mb={10}>
        <Heading as="h3" size="md">
          Ongoing Return Trackings
        </Heading>
        {returnTrackingGroups.length > 0 && <List>
          {returnTrackingGroups.map((group) => (
            <ListItem key={group.id}>
              <Link
                href={`/bases/${baseId}/distributions/return-trackings/${group.id}`}
              >
                <>{group.createdOn.toLocaleDateString()} - {group.createdOn.toLocaleTimeString()} ({group.distributionEvents.length} Events)</>
              </Link>
            </ListItem>
          ))}
          </List>}
        {returnTrackingGroups.length === 0 && <Text>There are currently no ongoing Return Trackings.</Text>}

      </VStack>

      <VStack>
        <Heading as="h3" size="md">
          Start new Return Tracking
        </Heading>
        {showMessageAboutPastEventsNotYetInReturnState && (
          <Text backgroundColor="orange.100" textAlign="center">
            <BellIcon /> You still have past events which are not yet in the
            "Returned" state.
            <br />
            In the "Distributions" Tab, you can change their state. <br />
            Only then they will be listed here.
          </Text>
        )}
        <Text mb={5}>
          Please select the Distribution Events that you want to track returned
          items for.
        </Text>
        <Text backgroundColor={"orange.100"} m={5} p={3}>
          Attention: Once you started a Return Tracking for a group of events,
          you cannot change this group selection later anymore (
          <Link>What does that mean?</Link>).
        </Text>
        <Box backgroundColor="gray.50">
          {distroEventsToShowGroupedByDay.map(({ date, events }) => {
            const groupName = `${date.toLocaleDateString()} (${weekDayNumberToWeekDayName(
              getDay(date)
            )})`;
            const allValuesWithLabelsOfCurrentGroup = events.map(
              (el) =>
                [
                  el.id,
                  `${
                    el.distributionSpot.name
                  } (${el.plannedStartDateTime.toLocaleTimeString()})`,
                ] as [string, string]
            );
            const allValuesOfCurrentGroup = events.map((el) => el.id);
            return (
              <Box mb={4}>
                <CheckboxGroup
                  key={date.toISOString()}
                  groupName={groupName}
                  allValuesWithLabels={allValuesWithLabelsOfCurrentGroup}
                  selectedValues={selectedValues.filter((el) =>
                    allValuesOfCurrentGroup.includes(el)
                  )}
                  onChange={(newSelectedValues, newUnselectedValues) => {
                    setSelectedValues((prev) => {
                      return [
                        ...prev.filter(
                          (el) => !newUnselectedValues.includes(el)
                        ),
                        ...newSelectedValues.filter((el) => !prev.includes(el)),
                      ];
                    });
                  }}
                />
              </Box>
            );
          })}
        </Box>

        <Button my={2} onClick={onStartReturnTrackingClick} colorScheme="blue">
          Start return tracking
        </Button>
      </VStack>
    </VStack>
  );
};

export default DistributionListForReturnTracking;
