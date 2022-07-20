import { useMutation } from "@apollo/client";
import { ArrowRightIcon } from "@chakra-ui/icons";
import { Box, VStack, Text, Button } from "@chakra-ui/react";
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
import { DistributionEventState } from "views/Distributions/types";
import * as yup from "yup";
import DistroEventDetailsForPlanningStateContainer from "./State1Planning/DistroEventDetailsForPlanningStateContainer";
import DistroEventDetailsForPackingStateContainer from "./State2Packing/DistroEventDetailsForPackingStateContainer";

const distributionSpotSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
});

// TODO: if we don't end up using yup at all: remove this and instead define a
// equivalent type in pure TS
// export interface DistributionEventDetails {
//     id: string;
//     name?: string;
//     startDate: Date;
//     state: DistributionEventState;
//     distributionSpot: {
//         id: string;
//         name?: string;
//     }
// }
export const distributionEventDetailsSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  plannedStartDateTime: yup.date().required(),
  state: yup
    .mixed<DistributionEventState>()
    .oneOf(Object.values(DistributionEventState))
    .required(),
  distributionSpot: distributionSpotSchema,
});

export interface DistributionEventDetails
  extends yup.InferType<typeof distributionEventDetailsSchema> {}

export interface DistroEventContainerProps {
  distributionEventDetails: DistributionEventDetails;
}
const DistroEventContainer = ({
  distributionEventDetails,
}: DistroEventContainerProps) => {
  const [moveEventToNextStageMutation] = useMutation<
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

  const nextState = useMemo(() => getNextState(distributionEventDetails.state), [distributionEventDetails.state]);
  const moveEventToNextStage = useCallback(() => {
    moveEventToNextStageMutation({
      variables: {
        distributionEventId: distributionEventDetails.id,
        newState: nextState,
      },
    });
  }, [distributionEventDetails.id, moveEventToNextStageMutation, nextState]);

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
    <VStack>
      <Box>
        <Text fontSize="xl">
          {distributionEventDetails.distributionSpot.name}
        </Text>
        <Text fontSize="xl" mb={2} borderBottom="1px" borderColor="gray.300">
          {distributionEventDetails.plannedStartDateTime?.toDateString()}
        </Text>
        <DistributionStateProgressBar
          activeState={distributionEventDetails.state}
        />
      </Box>
      <Button onClick={moveEventToNextStage}>
        Move to next stage ({distroEventStateHumanReadableLabels.get(nextState)})
        <ArrowRightIcon />
      </Button>
      <Box>
        <StateSpecificComponent />
      </Box>
    </VStack>
  );
};

export default DistroEventContainer;
