import { useMutation } from "@apollo/client";
import {
  Box,
  VStack,
  Text,
  Button,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import BTBreadcrumbNavigation from "components/BTBreadcrumbNavigation";
import React, { useCallback, useMemo } from "react";
import {
  ChangeDistributionEventStateMutation,
  ChangeDistributionEventStateMutationVariables,
} from "types/generated/graphql";
import { distroEventStateHumanReadableLabels } from "views/Distributions/baseData";
import DistributionStateProgressBar from "views/Distributions/components/DistributionStateProgressBar";
import { getNextState } from "views/Distributions/helpers";
import {
  CHANGE_DISTRIBUTION_EVENT_STATE_MUTATION,
  DISTRIBUTION_EVENT_QUERY,
} from "views/Distributions/queries";
import {
  DistributionEventDetails,
  DistributionEventState,
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

  // const nextState = useMemo(
  //   () => getNextState(distributionEventDetails.state),
  //   [distributionEventDetails.state]
  // );

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

  const eventStateToComponentMapping: {
    [key in DistributionEventState]: React.FC;
  } = {
    [DistributionEventState.Planning]: () => (
      <DistroEventDetailsForPlanningStateContainer
        distributionEventDetails={distributionEventDetails}
      />
    ),
    // [DistributionEventState.PlanningDone]: () => <Box>PlanningDone</Box>,
    [DistributionEventState.Packing]: () => (
      <DistroEventDetailsForPackingStateContainer
        distributionEventDetails={distributionEventDetails}
      />
    ),
    // [DistributionEventState.PackingDone]: () => <Box>PackingDone</Box>,
    [DistributionEventState.OnDistro]: () => <Box>OnDistro</Box>,
    [DistributionEventState.Returned]: () => <Box>Returned</Box>,
    // [DistributionEventState.ReturnsTracked]: () => <Box>ReturnsTracked</Box>,
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
          <Text fontSize="xl">
            {distributionEventDetails.distributionSpot.name}
          </Text>
          <Text fontSize="xl" mb={2} borderBottom="1px" borderColor="gray.300">
            {distributionEventDetails.plannedStartDateTime?.toDateString()}
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
