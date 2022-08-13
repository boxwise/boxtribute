import { BellIcon } from "@chakra-ui/icons";
import {
  Box,
  Checkbox,
  Heading,
  LinkBox,
  LinkOverlay,
  List,
  ListItem,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { getDay, isToday, parseISO, weeksToDays } from "date-fns";
import isFuture from "date-fns/isFuture";
import isPast from "date-fns/isPast";
import _ from "lodash";
import React, { useState } from "react";
import { weekDayNumberToWeekDayName } from "utils/helpers";
import { useGetUrlForResourceHelpers } from "utils/hooks";
import {
  DistributionEventDetails,
  DistributionEventState,
} from "views/Distributions/types";
import { map } from "zod";

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
  // const [checkedItems, setCheckedItems] = React.useState(selectedValues)

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

  const pastDistroEventsNotInReturnStateNorCompleted = _.chain(
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
    pastDistroEventsNotInReturnStateNorCompleted.length > 0;

  const distroEventsToShowGroupedByDay = _.chain(
    sortedDistroEventsWhichNeedReturnTracking
  )
    .groupBy((el) => el.plannedStartDateTime.toISOString())
    .map((events, date) => ({ date: parseISO(date), events }))
    // .orderBy()
    .value();

  // TODO: name the following const better
  // Or consider to move them together with the jsx/template code below
  // into a dedicated component
  const allValues = sortedDistroEventsWhichNeedReturnTracking.map(
    (el) => el.id
  );
  const [selectedValues, setSelectedValues] = useState(allValues);

  return (
    <VStack>
      <Heading as="h2" py={10} size="lg" textAlign="center">
        Distribution Events: Returned Items Tracking
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
      {/* <ListOfEvents distributionEventsListData={distroEventsToday} /> */}
      <Box backgroundColor="gray.50">
        {distroEventsToShowGroupedByDay.map(({ date, events }) => {
          const groupName = `${date.toLocaleDateString()} (${weekDayNumberToWeekDayName(
            getDay(date)
          )})`;
          const allValuesWithLabelsOfCurrentGroup = events.map((el) => [
            el.id,
            `${
              el.distributionSpot.name
            } (${el.plannedStartDateTime.toLocaleTimeString()})`,
          ] as [string, string]);
          const allValuesOfCurrentGroup = events.map((el) => el.id);
          return (
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
                    ...prev.filter((el) => !newUnselectedValues.includes(el)),
                    ...newSelectedValues.filter((el) => !prev.includes(el)),
                  ];
                });
              }}
            />
          );
        })}
      </Box>
    </VStack>
  );
};

export default DistributionListForReturnTracking;
