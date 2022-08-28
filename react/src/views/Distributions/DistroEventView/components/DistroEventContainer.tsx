import { useMutation } from "@apollo/client";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Link,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import BTBreadcrumbNavigation from "components/BTBreadcrumbNavigation";
import React, { useCallback } from "react";
import {
  ChangeDistributionEventStateMutation,
  ChangeDistributionEventStateMutationVariables,
  DistributionEventState,
} from "types/generated/graphql";
import { useGetUrlForResourceHelpers } from "utils/hooks";
import DistributionEventTimeRangeDisplay from "views/Distributions/components/DistributionEventTimeRangeDisplay";
import DistributionStateProgressBar from "views/Distributions/components/DistributionStateProgressBar";
import {
  CHANGE_DISTRIBUTION_EVENT_STATE_MUTATION,
  DISTRIBUTION_EVENT_QUERY,
} from "views/Distributions/queries";
import {
  DistributionEventDetails,
  DistributionEventStateSchema,
} from "views/Distributions/types";
import DistroEventDetailsForPlanningStateContainer from "./State1Planning/DistroEventDetailsForPlanningStateContainer";
import DistroEventDetailsForPackingStateContainer from "./State2Packing/DistroEventDetailsForPackingStateContainer";

export interface DistroEventContainerProps {
  distributionEventDetails: DistributionEventDetails;
}
const DistroEventContainer = ({
  distributionEventDetails,
}: DistroEventContainerProps) => {
  const [moveEventToStageMutation] = useMutation<
    ChangeDistributionEventStateMutation,
    ChangeDistributionEventStateMutationVariables
  >(CHANGE_DISTRIBUTION_EVENT_STATE_MUTATION, {
    refetchQueries: [
      {
        query: DISTRIBUTION_EVENT_QUERY,
        variables: {
          eventId: distributionEventDetails.id,
        },
      },
      // {
      //   query: PACKING_LIST_ENTRIES_FOR_DISTRIBUTION_EVENT_QUERY,
      //   variables: {
      //     distributionEventId: distributionEventDetails.id,
      //   },
      // },
    ],
  });

  const nextStageTransitionAlertState = useDisclosure();
  const cancelNextStageTransitionRef = React.useRef<HTMLButtonElement>(null);

  const onMoveToStage = useCallback(
    (state: DistributionEventState) => {
      if (state === DistributionEventStateSchema.enum.Completed) {
        nextStageTransitionAlertState.onOpen();
        return;
      }

      moveEventToStageMutation({
        variables: {
          distributionEventId: distributionEventDetails.id,
          newState: state,
        },
      });
    },
    [
      distributionEventDetails.id,
      moveEventToStageMutation,
      nextStageTransitionAlertState,
    ]
  );

  const onConfirmToMarkEventAsCompleted = useCallback(() => {
    moveEventToStageMutation({
      variables: {
        distributionEventId: distributionEventDetails.id,
        newState: DistributionEventState.Completed,
      },
    });
    nextStageTransitionAlertState.onClose();
  }, [
    distributionEventDetails.id,
    moveEventToStageMutation,
    nextStageTransitionAlertState,
  ]);

  const { getDistroSpotDetailUrlById } = useGetUrlForResourceHelpers();

  const eventStateToComponentMapping: {
    [key in DistributionEventState]: React.FC;
  } = {
    [DistributionEventState.Planning]: () => (
      <DistroEventDetailsForPlanningStateContainer
        distributionEventDetails={distributionEventDetails}
      />
    ),
    [DistributionEventState.Packing]: () => (
      <DistroEventDetailsForPackingStateContainer
        distributionEventDetails={distributionEventDetails}
      />
    ),
    [DistributionEventState.OnDistro]: () => <Box>OnDistro</Box>,
    [DistributionEventState.ReturnedFromDistribution]: () => (
      <Box>Returned</Box>
    ),
    [DistributionEventState.ReturnTrackingInProgress]: () => (
      <Box>Return Trackign In Progress</Box>
    ),
    [DistributionEventState.Completed]: () => <Box>Completed</Box>,
  };

  const StateSpecificComponent =
    eventStateToComponentMapping[distributionEventDetails.state];
  return (
    <>
      <VStack spacing={25}>
        <BTBreadcrumbNavigation
          items={[{ label: 'Base "Subotica"', linkPath: "X" }]}
        />
        <Box>
          <Link
            href={getDistroSpotDetailUrlById(
              distributionEventDetails.distributionSpot.id
            )}
          >
            <Text fontSize="xl">
              {distributionEventDetails.distributionSpot.name}
            </Text>
          </Link>
          <Text
            fontSize="xl"
            mb={2}
            borderBottom="1px"
            borderColor="gray.300"
            as="time"
            dateTime={distributionEventDetails.plannedStartDateTime.toUTCString()}
          >
            <DistributionEventTimeRangeDisplay
              plannedStartDateTime={
                distributionEventDetails.plannedStartDateTime
              }
              plannedEndDateTime={distributionEventDetails.plannedEndDateTime}
            />
          </Text>
          <DistributionStateProgressBar
            activeState={distributionEventDetails.state}
            onMoveToStage={onMoveToStage}
          />
        </Box>
        {/* {nextState != null && (
          <Button onClick={() => onMoveToStage(nextState)}>
            Move to next stage (
            {distroEventStateHumanReadableLabels.get(nextState)})
          </Button>
        )} */}
        <VStack spacing={5}>
          <StateSpecificComponent />
        </VStack>
      </VStack>

      <AlertDialog
        isOpen={nextStageTransitionAlertState.isOpen}
        leastDestructiveRef={cancelNextStageTransitionRef}
        onClose={nextStageTransitionAlertState.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Mark Distribution Event as Completed
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelNextStageTransitionRef}
                onClick={nextStageTransitionAlertState.onClose}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={onConfirmToMarkEventAsCompleted}
                ml={3}
              >
                Mark Event as Completed
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default DistroEventContainer;
