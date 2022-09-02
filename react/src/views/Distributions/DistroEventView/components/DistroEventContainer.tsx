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
  Flex,
  Heading,
  Link,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import BTBreadcrumbNavigation from "components/BTBreadcrumbNavigation";
import React, { useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";
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
import DistroEventDetailsForReturnTrackingInProgressStateContainer from "./State4ReturnTrackingInProgress/DistroEventDetailsForReturnTrackingInProgressStateContainer";

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

  const { getBaseRootUrlForCurrentBase } = useGetUrlForResourceHelpers();

  const nextStageTransitionAlertState = useDisclosure();
  const cancelNextStageTransitionRef = React.useRef<HTMLButtonElement>(null);

  const onMoveToStage = useCallback(
    (state: DistributionEventState) => {
      if (
        [
          DistributionEventStateSchema.enum.ReturnedFromDistribution,
          DistributionEventStateSchema.enum.ReturnTrackingInProgress,
          DistributionEventStateSchema.enum.Completed,
        ].includes(state)
      ) {
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

  const onConfirmToMarkEventAsReturnedFromDistribution = useCallback(() => {
    moveEventToStageMutation({
      variables: {
        distributionEventId: distributionEventDetails.id,
        newState: DistributionEventState.ReturnedFromDistribution,
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
    [DistributionEventState.OnDistro]: () => <Box>This Distro Event is current on Distribution!</Box>,
    [DistributionEventState.ReturnedFromDistribution]: () => (
      <Flex w={[300, 400, 600]} direction="column" mb={4}>
        <Text textAlign={"center"}>
          <Heading as="h3" size="md">
            Returned from Distribution
          </Heading>
          You didn't start any Return Tracking for this Event yet. <br /> To do
          so, please go to the{" "}
          <Link
            variant={"inline-link"}
            as={RouterLink}
            to={`${getBaseRootUrlForCurrentBase()}/distributions/return-trackings`}
          >
            Return Tracking page
          </Link>{" "}
          and start a Return Tracking which includes this Distribution Event.
        </Text>
      </Flex>
    ),
    [DistributionEventState.ReturnTrackingInProgress]: () => (
      <DistroEventDetailsForReturnTrackingInProgressStateContainer
      distributionEventDetails={distributionEventDetails}
    />
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
            as={RouterLink}
            to={getDistroSpotDetailUrlById(
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
              Mark as Returned From Distribution
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
                onClick={onConfirmToMarkEventAsReturnedFromDistribution}
                ml={3}
              >
                Mark Event as Returned
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default DistroEventContainer;
